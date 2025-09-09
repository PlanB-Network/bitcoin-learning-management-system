import fs from 'node:fs';
import path from 'node:path';
import {
  createCreateCourseTranslationUpload,
  createDeleteCourseTranslationUploadsByCourseId,
  createGetCourseTranslationUploadById,
  createGetCourseTranslationUploads,
  createGetPartAndChapterIds,
  createInsertCourseTranslationSlide,
  createResetTranslationsToTodo,
  createSetTranslationsReadyForReview,
  createStartTranslations,
  createUpdateCourseTranslationUpload,
} from '@blms/service-content';
import type { Router } from 'express';
import formidable from 'formidable';
import type { Dependencies } from '#src/dependencies.js';
import { BadRequest, InternalServerError } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';
import { convertPptxToPngs } from '#src/utils/convert-api.js';
import {
  blobToString,
  buildS3Key,
  buildS3Keys,
  type ChapterGroup,
  categorizeFile,
  downloadRemoteFile,
  extractProfessorName,
  extractSlideNumber,
  fetchWithRetries,
  logMissingSlideContent,
  parseChapterKey,
  processZipFiles,
  TRANSLATION_UPLOAD_CONSTANTS,
  type UploadFormData,
} from '#src/utils/translation-upload-helpers.js';

// Constants
const ALLOWED_DOWNLOAD_HOSTNAMES = (
  process.env.ALLOWED_DOWNLOAD_HOSTNAMES ?? 'workspace.planb.network'
)
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

const receiveUploadForm = (req: any): Promise<UploadFormData> => {
  return new Promise<UploadFormData>((resolve, reject) => {
    const form = formidable({ multiples: true, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(new InternalServerError('Failed to parse form data'));
        return;
      }

      const courseId = Array.isArray(fields.courseId)
        ? fields.courseId[0]
        : fields.courseId;
      const languagesField = Array.isArray(fields.languages)
        ? fields.languages[0]
        : fields.languages;
      const urlField = Array.isArray(fields.url) ? fields.url[0] : fields.url;

      if (!courseId || !languagesField) {
        reject(new BadRequest('Missing courseId or languages'));
        return;
      }

      let languages: string[];
      try {
        languages = JSON.parse(languagesField as string);
        if (!Array.isArray(languages)) {
          throw new Error('languages is not an array');
        }
      } catch {
        // fallback: comma-separated list
        languages = (languagesField as string).split(',').map((l) => l.trim());
      }

      // Flatten received files and expand zip archives
      const fileList: formidable.File[] = [];
      for (const value of Object.values(files)) {
        if (Array.isArray(value)) {
          fileList.push(...value);
        } else if (value) {
          fileList.push(value);
        }
      }

      // If an URL is provided instead of direct file upload, download it as a temporary zip
      if (urlField && typeof urlField === 'string' && urlField.trim().length) {
        try {
          const remoteFile = await downloadRemoteFile(
            urlField.trim(),
            ALLOWED_DOWNLOAD_HOSTNAMES,
          );
          fileList.push(remoteFile);
        } catch (e) {
          console.error('Failed to download remote zip', e);
          reject(new BadRequest('Failed to download remote zip'));
          return;
        }
      }

      const finalFiles = await processZipFiles(fileList);

      resolve({
        courseId: courseId as string,
        languages,
        files: finalFiles,
      });
    });
  });
};

/**
 * Async function to poll translation task in background
 */
async function pollTranslationTask(
  dependencies: Dependencies,
  taskId: string,
  courseId: string,
  languages: string[],
  originalLanguage: string,
  setReadyService: (courseId: string, languages: string[]) => Promise<void>,
  resetToTodoService: (courseId: string, languages: string[]) => Promise<void>,
) {
  try {
    console.log(`[Translation] Starting background polling for task ${taskId}`);

    // Poll with longer timeout for background processing (up to 10 minutes)
    const manifest = await dependencies.languageToolkit.pollTask(taskId, {
      intervalMs: 5000, // Check every 5 seconds
      maxAttempts: 120, // Maximum 10 minutes (120 * 5s)
    });

    if (manifest) {
      await insertSlidesFromManifest(
        manifest,
        courseId,
        originalLanguage,
        dependencies,
      );

      const langList = languages.map((l) => l.toLowerCase());
      await setReadyService(courseId, langList);

      console.log(
        `[Translation] Successfully completed translation for course ${courseId}`,
      );

      // TODO: Send success notification (email, websocket, or database flag)
    } else {
      throw new Error('Translation task did not return expected data');
    }
  } catch (error) {
    console.error(`[Translation] Error processing course ${courseId}:`, error);

    // Only reset status if it's a real translation failure, not a parsing error
    const shouldResetStatus =
      error instanceof Error &&
      !error.message.includes('Zod') &&
      !error.message.includes('parsing');

    if (shouldResetStatus) {
      await resetToTodoService(courseId, languages);
      console.log(
        `[Translation] Status reset to 'todo' for course ${courseId} due to failure`,
      );
    } else {
      console.log(
        `[Translation] Keeping current status for course ${courseId} due to parsing/non-critical error`,
      );
    }

    // TODO: Send failure notification (email, websocket, or database flag)
  }
}

/**
 * Read manifest JSON structure and insert slide rows into DB.
 */
async function insertSlidesFromManifest(
  manifest: any,
  courseId: string,
  originalLanguage: string,
  dependencies: Dependencies,
) {
  if (!manifest || typeof manifest !== 'object') return;

  const courseNode = manifest[courseId];
  if (!courseNode) return;

  // Initialize slide insertion service once
  const insertSlide = createInsertCourseTranslationSlide(dependencies as any);

  // Iterate languages (target languages)
  for (const [langKey, parts] of Object.entries(courseNode as any)) {
    if (typeof parts !== 'object') continue;

    for (const [partId, chapters] of Object.entries(parts as any)) {
      if (typeof chapters !== 'object') continue;

      for (const [chapterId, slides] of Object.entries(chapters as any)) {
        if (typeof slides !== 'object') continue;

        for (const [slideId, files] of Object.entries(slides as any)) {
          const filePair = files as { pptx?: string; text?: string };
          if (!filePair || !filePair.text) continue; // need at least text filename

          const { pptx: pptxFile, text: textFile } = filePair;

          const slideNumber = extractSlideNumber(textFile);
          const { translatedPptKey, translatedTextKey, originalTextKey } =
            buildS3Keys(
              courseId,
              langKey,
              partId,
              chapterId,
              slideId,
              originalLanguage,
              pptxFile,
              textFile,
            );

          const { origBlob, transBlob } = await fetchWithRetries(
            dependencies,
            originalTextKey!,
            translatedTextKey!,
          );

          if (!origBlob || !transBlob) {
            logMissingSlideContent(
              courseId,
              langKey,
              partId,
              chapterId,
              slideId,
              originalTextKey!,
              translatedTextKey!,
              translatedPptKey,
              origBlob,
              transBlob,
              TRANSLATION_UPLOAD_CONSTANTS.MAX_RETRIES,
            );
          }

          const originalContent = blobToString(origBlob);
          const translatedContent = blobToString(transBlob);
          const professorName = extractProfessorName(textFile);

          await insertSlide(
            courseId,
            langKey,
            partId,
            chapterId,
            slideId,
            slideNumber,
            professorName,
            translatedPptKey,
            originalContent,
            translatedContent,
          );
        }
      }
    }
  }
}

/**
 * Transform language codes for the Language Toolkit API
 * Some languages need to be mapped to specific regional variants
 */
const transformLanguageCodesForAPI = (languages: string[]): string[] => {
  const transformed = languages.map((lang) => {
    // Transform Portuguese from 'pt' to 'pt-pt' for the API
    if (lang === 'pt') {
      console.log('[Translation] Transforming language code: pt -> pt-pt');
      return 'pt-pt';
    }
    return lang;
  });

  console.log(
    `[Translation] Language codes: ${languages.join(', ')} -> ${transformed.join(', ')}`,
  );
  return transformed;
};

export const createRestTranslationUploadRoutes = async (
  dependencies: Dependencies,
  router: Router,
) => {
  const createUpload = createCreateCourseTranslationUpload(dependencies as any);
  const updateUpload = createUpdateCourseTranslationUpload(dependencies as any);
  const startTranslations = createStartTranslations(dependencies as any);
  const getPartAndChapterIdsService = createGetPartAndChapterIds(
    dependencies as any,
  );
  const getUploadsService = createGetCourseTranslationUploads(
    dependencies as any,
  );
  const deleteUploadsService = createDeleteCourseTranslationUploadsByCourseId(
    dependencies as any,
  );
  const setReadyService = createSetTranslationsReadyForReview(
    dependencies as any,
  );
  const resetToTodoService = createResetTranslationsToTodo(dependencies as any);
  const getUploadByIdService = createGetCourseTranslationUploadById(
    dependencies as any,
  );

  /**
   * Delete all S3 files for a course in English language
   */
  const deleteS3FilesForCourse = async (
    courseId: string,
    originalLanguage = 'en',
  ) => {
    try {
      // List all files in the course's English folder
      const prefix = `contribute/${courseId}/${originalLanguage}/`;
      const fileKeys = await dependencies.s3.list(prefix);

      if (fileKeys && fileKeys.length > 0) {
        console.log(
          `[UPLOAD] Deleting ${fileKeys.length} existing files for course ${courseId}`,
        );

        // Delete each file
        for (const fileKey of fileKeys) {
          await dependencies.s3.delete(fileKey);
        }

        console.log(
          `[UPLOAD] Successfully deleted all files for course ${courseId}`,
        );
      }
    } catch (error) {
      console.error(
        `[UPLOAD] Error deleting S3 files for course ${courseId}:`,
        error,
      );
      // Don't throw - continue with upload even if deletion fails
    }
  };

  const processFileUpload = async (
    uid: string,
    courseId: string,
    languages: string[],
    initialFiles: formidable.File[],
  ) => {
    // Check existing uploads for this course
    const existingUploads = await getUploadsService(courseId);

    // Since we now assume all files are in English, we hardcode the original language
    const originalLanguage = 'en';

    const filesProvided = initialFiles.length > 0;

    if (!filesProvided && existingUploads.length === 0) {
      throw new BadRequest(
        'No files provided and no existing uploads found for this course',
      );
    }

    // If no new files provided, return existing upload info
    if (!filesProvided) {
      return {
        uploadId: `existing-${courseId}`,
        courseId,
        languages,
        originalLanguage,
        filesUploaded: false,
        message: 'Using existing uploads',
      };
    }

    // If new files are provided and uploads already exist, overwrite by deleting old rows AND S3 files
    if (filesProvided && existingUploads.length > 0) {
      // Delete S3 files first
      await deleteS3FilesForCourse(courseId, originalLanguage);

      // Then delete database records
      await deleteUploadsService(courseId);
    }

    const files = initialFiles;

    // Log extracted files for debugging
    console.log(
      `[UPLOAD] Processing ${files.length} files for course ${courseId}`,
    );
    for (const file of files) {
      console.log(
        `[UPLOAD] File: ${file.originalFilename}, MIME: ${file.mimetype}`,
      );
    }

    // Organize files per chapter key "part.chapter"
    const chapterGroups = new Map<string, ChapterGroup>();

    for (const file of files) {
      const relativePath = file.originalFilename ?? (file as any).newFilename;
      const chapterInfo = parseChapterKey(relativePath);

      if (!chapterInfo) {
        // Skip files not matching expected pattern
        console.warn(
          `[UPLOAD] Skipping file (no chapter pattern): ${relativePath}`,
        );
        continue;
      }

      const { partIndex, chapterIndex } = chapterInfo;
      const key = `${partIndex}.${chapterIndex}`;

      let group = chapterGroups.get(key);
      if (!group) {
        group = { txts: [] };
        chapterGroups.set(key, group);
      }

      const fileType = categorizeFile(file);
      if (fileType === 'pptx') {
        group.pptx = file;
      } else if (fileType === 'txt') {
        group.txts.push(file);
      }
    }

    if (chapterGroups.size === 0) {
      throw new BadRequest('No valid chapter files detected');
    }

    const uploadResults: any[] = [];

    for (const [key, group] of chapterGroups.entries()) {
      const [partIdxStr, chapIdxStr] = key.split('.');
      const partIndex = Number(partIdxStr);
      const chapterIndex = Number(chapIdxStr);

      let partId: string;
      let chapterId: string;
      try {
        const mapping = await getPartAndChapterIdsService(
          courseId,
          partIndex,
          chapterIndex,
        );
        partId = mapping.partId;
        chapterId = mapping.chapterId;
      } catch (_err) {
        // Skip chapters that don't exist in DB
        console.warn(
          `Skipping upload for unmapped part ${partIndex} chapter ${chapterIndex}`,
        );
        continue;
      }

      let pptxKey: string | undefined;

      // upload pptx once per chapter (or skip if absent)
      if (group.pptx) {
        const pptFile = group.pptx;
        const base = path.basename(pptFile.originalFilename ?? 'upload.pptx');
        pptxKey = buildS3Key(
          'pptx',
          courseId,
          originalLanguage,
          partId,
          chapterId,
          base,
        );
        console.log(`[UPLOAD] Uploading PPTX to S3: ${pptxKey}`);

        // Check file size before upload
        const stats = fs.statSync(pptFile.filepath);
        console.log(`[UPLOAD] PPTX file size: ${stats.size} bytes`);

        if (stats.size === 0) {
          console.error(
            `[UPLOAD] PPTX file is empty: ${pptFile.originalFilename}`,
          );
          continue;
        }

        const stream = fs.createReadStream(pptFile.filepath);

        await dependencies.s3.upload(pptxKey, stream, {
          contentType: TRANSLATION_UPLOAD_CONSTANTS.MIME_TYPES.PPTX,
        });

        // After successful upload → convert to PNG slides via ConvertAPI
        try {
          console.log(`[UPLOAD] Starting PPTX conversion for: ${pptxKey}`);
          // Pass the exact pptxKey that was used for upload
          // ConvertAPI should use this exact key to find the file
          await convertPptxToPngs(dependencies, pptxKey);
          console.log(`[UPLOAD] PPTX conversion completed for: ${pptxKey}`);
        } catch (err) {
          console.error(
            `[UPLOAD] Failed to convert PPTX to PNGs via ConvertAPI for ${pptxKey}:`,
            err,
          );
        }
      }

      // each txt => one DB row
      for (const txt of group.txts) {
        const baseTxt = path.basename(txt.originalFilename ?? 'slide.txt');
        const txtKey = buildS3Key(
          'text',
          courseId,
          originalLanguage,
          partId,
          chapterId,
          baseTxt,
        );
        const stream = fs.createReadStream(txt.filepath);

        await dependencies.s3.upload(txtKey, stream, {
          contentType: TRANSLATION_UPLOAD_CONSTANTS.MIME_TYPES.TEXT,
        });

        const uploadRecord = await (createUpload as any)(
          courseId,
          originalLanguage,
          languages,
          uid,
          partId,
          chapterId,
          pptxKey,
          txtKey,
        );

        await updateUpload(uploadRecord.id, pptxKey, txtKey, true, undefined);
        uploadResults.push(uploadRecord);
      }
    }

    // Return the first upload record ID as the upload identifier
    const uploadId =
      uploadResults.length > 0 ? uploadResults[0].id : `existing-${courseId}`;

    return {
      uploadId,
      courseId,
      languages,
      originalLanguage,
      filesUploaded: true,
      uploadCount: uploadResults.length,
      uploadRecords: uploadResults,
      message: 'Files uploaded successfully',
    };
  };

  const startTranslationFromUpload = async (
    uploadId: string,
    languages: string[],
  ) => {
    let courseId: string;

    // Handle existing uploads (legacy format)
    if (uploadId.startsWith('existing-')) {
      courseId = uploadId.replace('existing-', '');
    } else {
      // For real upload IDs, get the course from the upload record
      try {
        const uploadRecord = await getUploadByIdService(uploadId);
        if (!uploadRecord) {
          throw new BadRequest('Upload not found');
        }
        courseId = uploadRecord.courseId;
      } catch (_error) {
        throw new BadRequest('Invalid upload ID');
      }
    }

    // Since we now assume all files are in English, we hardcode the original language
    const originalLanguage = 'en';

    // Start translations for selected languages
    await startTranslations({ courseId, languages });

    try {
      const taskId = await dependencies.languageToolkit.translateCourse({
        course_id: courseId,
        source_lang: 'en',
        target_langs: transformLanguageCodesForAPI(languages),
      });

      if (!taskId) {
        // If no task ID returned, reset status and throw error
        await resetToTodoService(courseId, languages);
        throw new InternalServerError('Failed to start translation task');
      }

      // Start async polling in background (fire and forget)
      pollTranslationTask(
        dependencies,
        taskId,
        courseId,
        languages,
        originalLanguage,
        setReadyService,
        resetToTodoService,
      ).catch((error) => {
        console.error('[Translation] Background polling failed:', error);
      });

      return {
        taskId,
        courseId,
        languages,
        status: 'processing',
        message: 'Translation started successfully',
      };
    } catch (error) {
      // Reset status on any error during initial request
      await resetToTodoService(courseId, languages);
      console.error('[Translation] Error starting translation:', error);

      if (error instanceof Error) {
        throw new InternalServerError(
          `Failed to start translation: ${error.message}`,
        );
      }
      throw new InternalServerError('Failed to start translation');
    }
  };

  const processTranslationUpload = async (
    uid: string,
    courseId: string,
    languages: string[],
    initialFiles: formidable.File[],
  ) => {
    // Check existing uploads for this course
    const existingUploads = await getUploadsService(courseId);

    // Since we now assume all files are in English, we hardcode the original language
    const originalLanguage = 'en';

    const filesProvided = initialFiles.length > 0;

    if (!filesProvided && existingUploads.length === 0) {
      throw new BadRequest(
        'No files provided and no existing uploads found for this course',
      );
    }

    // If new files are provided and uploads already exist, overwrite by deleting old rows AND S3 files
    if (filesProvided && existingUploads.length > 0) {
      // Delete S3 files first
      await deleteS3FilesForCourse(courseId, originalLanguage);

      // Then delete database records
      await deleteUploadsService(courseId);
    }

    const files = initialFiles;

    // If no new files provided, directly trigger translations and toolkit, skip upload processing
    if (!filesProvided) {
      // Start translations for selected languages
      await startTranslations({ courseId, languages });

      try {
        const taskId = await dependencies.languageToolkit.translateCourse({
          course_id: courseId,
          source_lang: 'en',
          target_langs: languages,
        });

        if (!taskId) {
          // If no task ID returned, reset status and throw error
          await resetToTodoService(courseId, languages);
          throw new InternalServerError('Failed to start translation task');
        }

        // Start async polling in background (fire and forget)
        pollTranslationTask(
          dependencies,
          taskId,
          courseId,
          languages,
          originalLanguage,
          setReadyService,
          resetToTodoService,
        ).catch((error) => {
          console.error('[Translation] Background polling failed:', error);
        });

        // Return immediately with task ID
        return {
          message: 'Translation started without new uploads',
          taskId,
          status: 'processing',
        } as const;
      } catch (error) {
        // Reset status on any error during initial request
        await resetToTodoService(courseId, languages);
        console.error('[Translation] Error starting translation:', error);

        if (error instanceof Error) {
          throw new InternalServerError(
            `Failed to start translation: ${error.message}`,
          );
        }
        throw new InternalServerError('Failed to start translation');
      }
    }

    // Organize files per chapter key "part.chapter"
    const chapterGroups = new Map<string, ChapterGroup>();

    for (const file of files) {
      const relativePath = file.originalFilename ?? (file as any).newFilename;
      const chapterInfo = parseChapterKey(relativePath);

      if (!chapterInfo) {
        // Skip files not matching expected pattern
        console.warn(
          `[UPLOAD] Skipping file (no chapter pattern): ${relativePath}`,
        );
        continue;
      }

      const { partIndex, chapterIndex } = chapterInfo;
      const key = `${partIndex}.${chapterIndex}`;

      let group = chapterGroups.get(key);
      if (!group) {
        group = { txts: [] };
        chapterGroups.set(key, group);
      }

      const fileType = categorizeFile(file);
      if (fileType === 'pptx') {
        group.pptx = file;
      } else if (fileType === 'txt') {
        group.txts.push(file);
      }
    }

    if (chapterGroups.size === 0) {
      throw new BadRequest('No valid chapter files detected');
    }

    const uploadResults: any[] = [];

    for (const [key, group] of chapterGroups.entries()) {
      const [partIdxStr, chapIdxStr] = key.split('.');
      const partIndex = Number(partIdxStr);
      const chapterIndex = Number(chapIdxStr);

      let partId: string;
      let chapterId: string;
      try {
        const mapping = await getPartAndChapterIdsService(
          courseId,
          partIndex,
          chapterIndex,
        );
        partId = mapping.partId;
        chapterId = mapping.chapterId;
      } catch (_err) {
        // Skip chapters that don't exist in DB
        console.warn(
          `Skipping upload for unmapped part ${partIndex} chapter ${chapterIndex}`,
        );
        continue;
      }

      let pptxKey: string | undefined;

      // upload pptx once per chapter (or skip if absent)
      if (group.pptx) {
        const pptFile = group.pptx;
        const base = path.basename(pptFile.originalFilename ?? 'upload.pptx');
        pptxKey = buildS3Key(
          'pptx',
          courseId,
          originalLanguage,
          partId,
          chapterId,
          base,
        );
        console.log(`[UPLOAD] Uploading PPTX to S3: ${pptxKey}`);

        // Check file size before upload
        const stats = fs.statSync(pptFile.filepath);
        console.log(`[UPLOAD] PPTX file size: ${stats.size} bytes`);

        if (stats.size === 0) {
          console.error(
            `[UPLOAD] PPTX file is empty: ${pptFile.originalFilename}`,
          );
          continue;
        }

        const stream = fs.createReadStream(pptFile.filepath);

        await dependencies.s3.upload(pptxKey, stream, {
          contentType: TRANSLATION_UPLOAD_CONSTANTS.MIME_TYPES.PPTX,
        });

        // After successful upload → convert to PNG slides via ConvertAPI
        try {
          await convertPptxToPngs(dependencies, pptxKey);
        } catch (err) {
          console.error(
            '[UPLOAD] Failed to convert PPTX to PNGs via ConvertAPI',
            err,
          );
        }
      }

      // each txt => one DB row
      for (const txt of group.txts) {
        const baseTxt = path.basename(txt.originalFilename ?? 'slide.txt');
        const txtKey = buildS3Key(
          'text',
          courseId,
          originalLanguage,
          partId,
          chapterId,
          baseTxt,
        );
        const stream = fs.createReadStream(txt.filepath);

        await dependencies.s3.upload(txtKey, stream, {
          contentType: TRANSLATION_UPLOAD_CONSTANTS.MIME_TYPES.TEXT,
        });

        const uploadRecord = await (createUpload as any)(
          courseId,
          originalLanguage,
          languages,
          uid,
          partId,
          chapterId,
          pptxKey,
          txtKey,
        );

        await updateUpload(uploadRecord.id, pptxKey, txtKey, true, undefined);
        uploadResults.push(uploadRecord);
      }
    }

    // Start translations for selected languages
    await startTranslations({ courseId, languages });

    // Call Language Toolkit to trigger translation
    try {
      const secondTaskId = await dependencies.languageToolkit.translateCourse({
        course_id: courseId,
        source_lang: 'en',
        target_langs: transformLanguageCodesForAPI(languages),
      });

      if (!secondTaskId) {
        // If no task ID returned, reset status and throw error
        await resetToTodoService(courseId, languages);
        throw new InternalServerError('Failed to start translation task');
      }

      // Start async polling in background (fire and forget)
      pollTranslationTask(
        dependencies,
        secondTaskId,
        courseId,
        languages,
        originalLanguage,
        setReadyService,
        resetToTodoService,
      ).catch((error) => {
        console.error('[Translation] Background polling failed:', error);
      });

      // Return immediately with upload results and task ID
      return {
        uploads: uploadResults,
        taskId: secondTaskId,
        status: 'processing',
      };
    } catch (error) {
      // Reset status on any error during initial request
      await resetToTodoService(courseId, languages);
      console.error('[Translation] Error starting translation:', error);

      if (error instanceof Error) {
        throw new InternalServerError(
          `Failed to start translation: ${error.message}`,
        );
      }
      throw new InternalServerError('Failed to start translation');
    }
  };

  // Endpoint 1: Upload files only
  router.post(
    '/upload-translation-files',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;
      if (!uid) {
        return next(new InternalServerError('User session missing'));
      }

      receiveUploadForm(req)
        .then(({ courseId, languages, files: initialFiles }) =>
          processFileUpload(uid, courseId, languages, initialFiles),
        )
        .then((result) => res.json(result))
        .catch(next);
    },
  );

  // Endpoint 2: Start translation with uploaded files
  router.post(
    '/start-translation/:uploadId',
    expressAuthMiddleware,
    async (req, res, next) => {
      const uid = req.session.uid;
      const { uploadId } = req.params;
      const { languages } = req.body;

      if (!uid) {
        return next(new InternalServerError('User session missing'));
      }

      if (!uploadId || !languages) {
        return next(new BadRequest('Upload ID and languages are required'));
      }

      try {
        const result = await startTranslationFromUpload(uploadId, languages);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  // Legacy endpoint (kept for backward compatibility)
  router.post(
    '/translation-uploads',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;
      if (!uid) {
        return next(new InternalServerError('User session missing'));
      }

      receiveUploadForm(req)
        .then(({ courseId, languages, files: initialFiles }) =>
          processTranslationUpload(uid, courseId, languages, initialFiles),
        )
        .then((result) => res.json(result))
        .catch(next);
    },
  );

  // Endpoint to get all uploads for a course
  router.get(
    '/course-uploads/:courseId',
    expressAuthMiddleware,
    async (req, res, next) => {
      const { courseId } = req.params;

      if (!courseId) {
        return next(new BadRequest('Course ID is required'));
      }

      try {
        const uploads = await getUploadsService(courseId);
        res.json({
          courseId,
          uploads: uploads || [],
          count: uploads ? uploads.length : 0,
        });
      } catch (error) {
        console.error('[Upload] Error getting course uploads:', error);
        next(new InternalServerError('Failed to get course uploads'));
      }
    },
  );

  // Endpoint to check upload status
  router.get(
    '/upload-status/:uploadId',
    expressAuthMiddleware,
    async (req, res, next) => {
      const { uploadId } = req.params;

      if (!uploadId) {
        return next(new BadRequest('Upload ID is required'));
      }

      try {
        const uploadRecord = await getUploadByIdService(uploadId);

        if (!uploadRecord) {
          return next(new BadRequest('Upload not found'));
        }

        res.json({
          uploadId,
          courseId: uploadRecord.courseId,
          uploadSuccess: uploadRecord.uploadSuccess,
          errorMessage: uploadRecord.errorMessage,
          createdAt: uploadRecord.createdAt,
          updatedAt: uploadRecord.updatedAt,
        });
      } catch (error) {
        console.error('[Upload] Error checking upload status:', error);
        next(new InternalServerError('Failed to check upload status'));
      }
    },
  );

  // Endpoint to check translation task status
  router.get(
    '/translation-status/:taskId',
    expressAuthMiddleware,
    async (req, res, next) => {
      const { taskId } = req.params;

      if (!taskId) {
        return next(new BadRequest('Task ID is required'));
      }

      try {
        // Use the languageToolkit client to check status
        // We'll create a simple wrapper since the client doesn't expose this directly
        const baseUrl = process.env.LANGUAGE_TOOLKIT_BASE_URL;
        if (!baseUrl) {
          throw new Error('Language toolkit base URL not configured');
        }

        // Get fresh token using the same logic as the client
        const params = new URLSearchParams();
        params.append('username', process.env.LANGUAGE_TOOLKIT_CLIENT_ID || '');
        params.append(
          'password',
          process.env.LANGUAGE_TOOLKIT_CLIENT_SECRET || '',
        );

        const tokenRes = await fetch(`${baseUrl}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params,
        });

        if (!tokenRes.ok) {
          throw new Error('Failed to authenticate with Language Toolkit');
        }

        const tokenData = (await tokenRes.json()) as { access_token: string };

        // Now check task status
        const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch task status: ${response.status}`);
        }

        const data = (await response.json()) as {
          status?: string;
          error?: string | null;
          progress?: number;
        };

        // Return status and any error message
        res.json({
          taskId,
          status: data.status || 'unknown',
          error: data.error,
          progress: data.progress, // If the API provides progress info
        });
      } catch (error) {
        console.error('[Translation] Error checking task status:', error);
        next(new InternalServerError('Failed to check translation status'));
      }
    },
  );
};
