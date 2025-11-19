import fs from 'node:fs';
import path from 'node:path';
import {
  createCreateCourseTranslationUpload,
  createDeleteCourseTranslationUploadsByCourseId,
  createGetActiveTranslationJobs,
  createGetAllTranslationJobs,
  createGetCourseTranslationUploadById,
  createGetCourseTranslationUploads,
  createGetPartAndChapterIds,
  createGetTranslationJob,
  createInsertCourseTranslationSlide,
  createResetTranslationsToTodo,
  createSetTranslationsReadyForReview,
  createStartTranslations,
  createUpdateCourseTranslationUpload,
  createUpsertTranslationJob,
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

  // Translation job services
  const upsertTranslationJob = createUpsertTranslationJob(dependencies as any);
  const getTranslationJob = createGetTranslationJob(dependencies as any);
  const getAllTranslationJobs = createGetAllTranslationJobs(
    dependencies as any,
  );
  const getActiveTranslationJobs = createGetActiveTranslationJobs(
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

  /**
   * Background task to start translation and poll for results
   * Tracks progress in translationJobs cache for recovery and status checking
   */
  async function startAndPollTranslation(
    dependencies: Dependencies,
    courseId: string,
    languages: string[],
    originalLanguage: string,
    setReadyService: (courseId: string, languages: string[]) => Promise<void>,
    resetToTodoService: (
      courseId: string,
      languages: string[],
    ) => Promise<void>,
  ) {
    try {
      console.log(`[Translation] Starting translation for course ${courseId}`);

      // Track job status (persist to DB)
      await upsertTranslationJob(courseId, 'translation', 'starting', {
        languages,
        progress: 'Requesting translation from Language Toolkit...',
      });

      const taskId = await dependencies.languageToolkit.translateCourse({
        course_id: courseId,
        source_lang: 'en',
        target_langs: transformLanguageCodesForAPI(languages),
      });

      if (!taskId) {
        throw new Error('Failed to get task ID from Language Toolkit');
      }

      console.log(`[Translation] Got taskId ${taskId}, starting polling`);

      // Update status with taskId (persist to DB)
      await upsertTranslationJob(courseId, 'translation', 'polling', {
        languages,
        progress: 'Translation in progress...',
        taskId,
      });

      // Poll without timeout - translation can take as long as needed
      // Use onProgress callback to update job status in real-time
      const manifest = await dependencies.languageToolkit.pollTask(taskId, {
        intervalMs: 5000, // Check every 5 seconds
        maxAttempts: Number.MAX_SAFE_INTEGER, // No timeout - poll until completed or failed
        onProgress: async (ltProgress) => {
          // Update job with LT progress info in real-time
          await upsertTranslationJob(courseId, 'translation', 'polling', {
            languages,
            taskId,
            progress: ltProgress.message,
            processedFiles: ltProgress.current,
            totalFiles: ltProgress.total,
          });
        },
      });

      if (manifest) {
        console.log(
          `[Translation] Received manifest for course ${courseId}, inserting slides into database...`,
        );

        await upsertTranslationJob(courseId, 'translation', 'processing', {
          languages,
          progress: 'Inserting translated slides into database...',
          taskId,
        });

        await insertSlidesFromManifest(
          manifest,
          courseId,
          originalLanguage,
          dependencies,
        );

        console.log(
          `[Translation] Slides inserted successfully for course ${courseId}, setting status to 'ready for review'...`,
        );

        const langList = languages.map((l) => l.toLowerCase());
        await setReadyService(courseId, langList);

        // Mark as completed (persist to DB)
        await upsertTranslationJob(courseId, 'translation', 'completed', {
          languages,
          progress: 'Translation completed successfully!',
          taskId,
          completedAt: new Date(),
        });

        console.log(
          `[Translation] ✓ Successfully completed translation for course ${courseId}, languages: ${languages.join(', ')}`,
        );
      } else {
        throw new Error('Translation task did not return expected data');
      }
    } catch (error) {
      console.error(
        '[Translation] Error processing course %s:',
        courseId,
        error,
      );

      // Mark as failed (persist to DB)
      await upsertTranslationJob(courseId, 'translation', 'failed', {
        languages,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

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
    }
  }

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

    console.log(
      `[Translation] Launching background translation for course ${courseId}, languages: ${languages.join(', ')}`,
    );

    // Start async translation and polling in background (fire and forget)
    // This returns immediately without waiting for the Language Toolkit API
    startAndPollTranslation(
      dependencies,
      courseId,
      languages,
      originalLanguage,
      setReadyService,
      resetToTodoService,
    ).catch((error) => {
      console.error('[Translation] Background translation failed:', error);
    });

    console.log(
      `[Translation] API response returned immediately for course ${courseId} with status 'processing'`,
    );

    return {
      courseId,
      languages,
      status: 'processing',
      message: 'Translation started successfully',
    };
  };

  /**
   * Background task to process file upload with ConvertAPI
   * Includes progress tracking for better UX - persisted to DB
   */
  async function processFileUploadInBackground(
    uid: string,
    courseId: string,
    languages: string[],
    initialFiles: formidable.File[],
  ) {
    try {
      console.log(`[Upload] Starting background upload for course ${courseId}`);

      // Count total files (PPTX + TXT)
      const totalFiles = initialFiles.length;

      // Update status to processing with initial progress (persist to DB)
      await upsertTranslationJob(courseId, 'upload', 'processing', {
        progress: 'Preparing files for upload...',
        totalFiles,
        processedFiles: 0,
      });

      // Check existing uploads
      const existingUploads = await getUploadsService(courseId);
      const originalLanguage = 'en';
      const filesProvided = initialFiles.length > 0;

      if (!filesProvided && existingUploads.length === 0) {
        throw new BadRequest('No files provided and no existing uploads found');
      }

      // If no new files, return existing upload info
      if (!filesProvided) {
        await upsertTranslationJob(courseId, 'upload', 'completed', {
          uploadId: `existing-${courseId}`,
          progress: 'Using existing uploads',
        });
        return;
      }

      // Delete old uploads if they exist
      if (filesProvided && existingUploads.length > 0) {
        await upsertTranslationJob(courseId, 'upload', 'processing', {
          progress: 'Cleaning up old uploads...',
          totalFiles,
          processedFiles: 0,
        });

        await deleteS3FilesForCourse(courseId, originalLanguage);
        await deleteUploadsService(courseId);
      }

      // Organize files per chapter
      const chapterGroups = new Map<string, ChapterGroup>();
      for (const file of initialFiles) {
        const relativePath = file.originalFilename ?? (file as any).newFilename;
        const chapterInfo = parseChapterKey(relativePath);

        if (!chapterInfo) {
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
      let processedFiles = 0;

      // Process each chapter group
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
          console.warn(
            `Skipping unmapped part ${partIndex} chapter ${chapterIndex}`,
          );
          continue;
        }

        let pptxKey: string | undefined;

        // Upload PPTX if present
        if (group.pptx) {
          const pptFile = group.pptx;
          const base = path.basename(pptFile.originalFilename ?? 'upload.pptx');

          await upsertTranslationJob(courseId, 'upload', 'processing', {
            progress: `Uploading PPTX for chapter ${chapterIndex}...`,
            totalFiles,
            processedFiles,
            currentFile: base,
          });

          pptxKey = buildS3Key(
            'pptx',
            courseId,
            originalLanguage,
            partId,
            chapterId,
            base,
          );
          const stats = fs.statSync(pptFile.filepath);

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

          processedFiles++;

          // Convert PPTX to PNG
          await upsertTranslationJob(courseId, 'upload', 'converting', {
            progress: `Converting PPTX to images for chapter ${chapterIndex}...`,
            totalFiles,
            processedFiles,
            currentFile: base,
          });

          try {
            await convertPptxToPngs(dependencies, pptxKey);
          } catch (err) {
            console.error(
              `[UPLOAD] Failed to convert PPTX to PNGs for ${pptxKey}:`,
              err,
            );
          }
        }

        // Upload TXT files
        for (const txt of group.txts) {
          const baseTxt = path.basename(txt.originalFilename ?? 'slide.txt');

          await upsertTranslationJob(courseId, 'upload', 'processing', {
            progress: `Uploading text file for chapter ${chapterIndex}...`,
            totalFiles,
            processedFiles,
            currentFile: baseTxt,
          });

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

          processedFiles++;
        }
      }

      const uploadId =
        uploadResults.length > 0 ? uploadResults[0].id : `existing-${courseId}`;

      // Mark as completed (persist to DB)
      await upsertTranslationJob(courseId, 'upload', 'completed', {
        uploadId,
        totalFiles,
        processedFiles,
        progress: 'Upload completed successfully!',
        completedAt: new Date(),
      });

      console.log(
        `[Upload] ✓ Job for course ${courseId} completed successfully`,
      );
    } catch (error) {
      console.error(`[Upload] Job for course ${courseId} failed:`, error);

      // Mark as failed (persist to DB)
      await upsertTranslationJob(courseId, 'upload', 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Endpoint 1: Upload files only (returns immediately with courseId as job identifier)
  router.post(
    '/upload-translation-files',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;
      if (!uid) {
        return next(new InternalServerError('User session missing'));
      }

      receiveUploadForm(req)
        .then(async ({ courseId, languages, files: initialFiles }) => {
          // Check if a job is already in progress for this course
          const existingJob = await getTranslationJob(courseId, 'upload');
          if (existingJob && existingJob.status === 'processing') {
            // Return existing job status (allow recovery)
            console.log(
              `[Upload] Job already in progress for course ${courseId}, returning existing status`,
            );
            return res.status(200).json({
              courseId,
              status: existingJob.status,
              progress: existingJob.progress,
              totalFiles: existingJob.totalFiles,
              processedFiles: existingJob.processedFiles,
              message: 'Upload already in progress. Polling existing job.',
            });
          }

          // Initialize job status with courseId as key (persist to DB)
          await upsertTranslationJob(courseId, 'upload', 'starting', {
            progress: 'Starting upload...',
          });

          // Start background processing (fire and forget)
          processFileUploadInBackground(
            uid,
            courseId,
            languages,
            initialFiles,
          ).catch((error) => {
            console.error('[Upload] Background upload failed:', error);
          });

          // Return immediately with courseId (acts as job ID)
          res.status(202).json({
            courseId,
            status: 'starting',
            message:
              'Upload started successfully. Use /upload-job-status/:courseId to check progress.',
          });
        })
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

  // Endpoint to check upload job status (for polling during background upload)
  // Uses courseId as the job identifier for recovery and duplicate prevention
  router.get(
    '/upload-job-status/:courseId',
    expressAuthMiddleware,
    async (req, res, next) => {
      const { courseId } = req.params;

      if (!courseId) {
        return next(new BadRequest('Course ID is required'));
      }

      try {
        const job = await getTranslationJob(courseId, 'upload');

        if (!job) {
          return res.status(404).json({
            error: 'Job not found',
            message:
              'Upload job not found. It may have expired or never existed.',
          });
        }

        res.json(job);
      } catch (error) {
        console.error('[Upload] Error checking job status:', error);
        next(new InternalServerError('Failed to check upload job status'));
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
        const baseUrl = process.env.LT_BASE_URL;
        if (!baseUrl) {
          throw new Error('Language toolkit base URL not configured');
        }

        // Get fresh token using the same logic as the client
        const params = new URLSearchParams();
        params.append('username', process.env.LT_CLIENT_ID || '');
        params.append('password', process.env.LT_CLIENT_SECRET || '');

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

  // Endpoint to check translation job status (for polling and recovery)
  router.get(
    '/translation-job-status/:courseId',
    expressAuthMiddleware,
    async (req, res, next) => {
      const { courseId } = req.params;

      if (!courseId) {
        return next(new BadRequest('Course ID is required'));
      }

      try {
        const job = await getTranslationJob(courseId, 'translation');

        if (!job) {
          return res.status(404).json({
            error: 'Job not found',
            message:
              'Translation job not found. It may have expired or never existed.',
          });
        }

        res.json(job);
      } catch (error) {
        console.error('[Translation] Error checking job status:', error);
        next(new InternalServerError('Failed to check translation job status'));
      }
    },
  );

  // Endpoint to retry translation without re-uploading files
  router.post(
    '/retry-translation/:courseId',
    expressAuthMiddleware,
    async (req, res, next) => {
      const uid = req.session.uid;
      const { courseId } = req.params;
      const { languages } = req.body;

      if (!uid) {
        return next(new InternalServerError('User session missing'));
      }

      if (!courseId || !languages || !Array.isArray(languages)) {
        return next(
          new BadRequest('Course ID and languages array are required'),
        );
      }

      try {
        // Check if a translation job is already in progress (check DB)
        const existingJob = await getTranslationJob(courseId, 'translation');
        if (
          existingJob &&
          (existingJob.status === 'starting' ||
            existingJob.status === 'polling' ||
            existingJob.status === 'processing')
        ) {
          return res.status(200).json({
            courseId,
            status: existingJob.status,
            progress: existingJob.progress,
            message: 'Translation already in progress.',
          });
        }

        // Since we now assume all files are in English, we hardcode the original language
        const originalLanguage = 'en';

        // Start translations for selected languages
        await startTranslations({ courseId, languages });

        console.log(
          `[Translation] Retrying translation for course ${courseId}, languages: ${languages.join(', ')}`,
        );

        // Start async translation and polling in background (fire and forget)
        startAndPollTranslation(
          dependencies,
          courseId,
          languages,
          originalLanguage,
          setReadyService,
          resetToTodoService,
        ).catch((error) => {
          console.error('[Translation] Background translation failed:', error);
        });

        res.status(202).json({
          courseId,
          languages,
          status: 'starting',
          message:
            'Translation retry started successfully. Use /translation-job-status/:courseId to check progress.',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  // Endpoint to get all translation jobs (for admin jobs dashboard)
  router.get(
    '/translation-jobs',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const limit = Number(req.query.limit) || 50;
        const offset = Number(req.query.offset) || 0;

        const jobs = await getAllTranslationJobs(limit, offset);

        res.json({
          jobs,
          limit,
          offset,
          total: jobs.length,
        });
      } catch (error) {
        console.error('[Translation] Error getting all jobs:', error);
        next(new InternalServerError('Failed to get translation jobs'));
      }
    },
  );

  /**
   * Start job watchdog to monitor and fail stale jobs
   * Runs every 2 minutes and marks jobs as failed if not updated in 15 minutes
   */
  const startJobWatchdog = () => {
    const STALE_THRESHOLD = 15 * 60 * 1000; // 15 minutes

    const checkStaleJobs = async () => {
      try {
        const activeJobs = await getActiveTranslationJobs();

        for (const job of activeJobs) {
          const lastUpdateTime = new Date(job.lastUpdate).getTime();
          const timeSinceUpdate = Date.now() - lastUpdateTime;

          if (timeSinceUpdate > STALE_THRESHOLD) {
            console.log(
              `[Watchdog] Marking stale job as failed: ${job.courseId} (${job.type}) - no update for ${Math.floor(timeSinceUpdate / 60000)}min`,
            );

            await upsertTranslationJob(job.courseId, job.type, 'failed', {
              error: `Job stale - no update in ${Math.floor(timeSinceUpdate / 60000)} minutes. Possibly server restarted.`,
            });
          }
        }
      } catch (error) {
        console.error('[Watchdog] Error checking stale jobs:', error);
      }
    };

    // Run immediately on startup
    checkStaleJobs();

    // Then run every 2 minutes
    const interval = setInterval(checkStaleJobs, 2 * 60 * 1000);

    console.log('[Watchdog] Job watchdog started (checks every 2 minutes)');

    return () => clearInterval(interval);
  };

  /**
   * Resume polling on an existing translation task (after server restart)
   */
  const resumeTranslationPolling = async (
    courseId: string,
    languages: string[],
    taskId: string,
    originalLanguage: string,
  ) => {
    try {
      console.log(`[Recovery] Resuming polling for task ${taskId}`);

      await upsertTranslationJob(courseId, 'translation', 'polling', {
        languages,
        taskId,
        progress: 'Resumed polling after server restart...',
      });

      // Resume polling on existing taskId (don't create new task)
      const manifest = await dependencies.languageToolkit.pollTask(taskId, {
        intervalMs: 5000,
        maxAttempts: Number.MAX_SAFE_INTEGER,
      });

      if (manifest) {
        console.log(
          `[Recovery] Received manifest for course ${courseId}, inserting slides...`,
        );

        await upsertTranslationJob(courseId, 'translation', 'processing', {
          languages,
          taskId,
          progress: 'Inserting translated slides into database...',
        });

        await insertSlidesFromManifest(
          manifest,
          courseId,
          originalLanguage,
          dependencies,
        );

        const langList = languages.map((l) => l.toLowerCase());
        await setReadyService(courseId, langList);

        await upsertTranslationJob(courseId, 'translation', 'completed', {
          languages,
          taskId,
          progress: 'Translation completed successfully!',
          completedAt: new Date(),
        });

        console.log(
          `[Recovery] ✓ Successfully recovered translation for course ${courseId}`,
        );
      }
    } catch (error) {
      console.error('[Recovery] Failed to recover translation:', error);

      await upsertTranslationJob(courseId, 'translation', 'failed', {
        languages,
        error: error instanceof Error ? error.message : 'Recovery failed',
      });

      const shouldResetStatus =
        error instanceof Error &&
        !error.message.includes('Zod') &&
        !error.message.includes('parsing');

      if (shouldResetStatus) {
        await resetToTodoService(courseId, languages);
      }
    }
  };

  /**
   * Recover orphaned translation jobs after server restart
   * Resume polling for jobs that were in 'polling' status
   */
  const recoverOrphanedJobs = async () => {
    try {
      console.log('[Recovery] Checking for orphaned translation jobs...');

      const activeJobs = await getActiveTranslationJobs();

      for (const job of activeJobs) {
        // Only recover translation jobs with taskId (not uploads)
        if (job.type === 'translation' && job.taskId) {
          const timeSinceUpdate =
            Date.now() - new Date(job.lastUpdate).getTime();

          // If job was updated recently (< 5 min), it might still be running
          if (timeSinceUpdate < 5 * 60 * 1000) {
            console.log(
              `[Recovery] Resuming translation job for course ${job.courseId} with taskId ${job.taskId}`,
            );

            // Resume polling on existing taskId (don't create new LT task)
            resumeTranslationPolling(
              job.courseId,
              job.languages || [],
              job.taskId,
              'en',
            ).catch((error) => {
              console.error(
                `[Recovery] Failed to recover job for course ${job.courseId}:`,
                error,
              );
            });
          } else {
            console.log(
              `[Recovery] Job for course ${job.courseId} is too old (${Math.floor(timeSinceUpdate / 60000)}min), watchdog will handle it`,
            );
          }
        }
      }

      console.log('[Recovery] Job recovery completed');
    } catch (error) {
      console.error('[Recovery] Error during job recovery:', error);
    }
  };

  // Start watchdog and recovery on module initialization
  startJobWatchdog();
  recoverOrphanedJobs();

  return router;
};
