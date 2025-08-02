import fs from 'node:fs';
import path from 'node:path';

import {
  createCreateCourseTranslationUpload,
  createDeleteCourseTranslationUploadsByCourseId,
  createGetAvailableCourseTranslations,
  createGetCourseOriginalLanguage,
  createGetCourseTranslationUploads,
  createGetPartAndChapterIds,
  createInsertCourseTranslationSlide,
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
      const useEnglishField = Array.isArray(fields.useEnglish)
        ? fields.useEnglish[0]
        : fields.useEnglish;

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

      // Parse optional useEnglish flag
      let useEnglishOverride: boolean | undefined;
      if (typeof useEnglishField === 'string') {
        useEnglishOverride = useEnglishField.toLowerCase() === 'true';
      }

      resolve({
        courseId: courseId as string,
        languages,
        files: finalFiles,
        useEnglish: useEnglishOverride,
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
  const getAvailableCourseTranslations = createGetAvailableCourseTranslations(
    dependencies as any,
  );
  const getCourseOriginalLang = createGetCourseOriginalLanguage(
    dependencies as any,
  );

  const processTranslationUpload = async (
    uid: string,
    courseId: string,
    languages: string[],
    initialFiles: formidable.File[],
    useEnglishOverride?: boolean,
  ) => {
    // Check existing uploads for this course
    const existingUploads = await getUploadsService(courseId);

    // Get original language once (needed whether or not we upload files)
    const originalLanguage = await getCourseOriginalLang(courseId);
    if (!originalLanguage) {
      throw new InternalServerError('Course not found');
    }

    // Determine if we should use English as the intermediate language
    const enTranslations = await getAvailableCourseTranslations('en', courseId);
    let useEnglish =
      originalLanguage.toLowerCase() !== 'en' && enTranslations.length > 0;

    // If the client provided an explicit preference, override automatic decision
    if (typeof useEnglishOverride === 'boolean') {
      useEnglish = useEnglishOverride;
    }

    const filesProvided = initialFiles.length > 0;

    if (!filesProvided && existingUploads.length === 0) {
      throw new BadRequest(
        'No files provided and no existing uploads found for this course',
      );
    }

    // If new files are provided and uploads already exist, overwrite by deleting old rows
    if (filesProvided && existingUploads.length > 0) {
      await deleteUploadsService(courseId);
    }

    const files = initialFiles;

    // If no new files provided, directly trigger translations and toolkit, skip upload processing
    if (!filesProvided) {
      // Start translations for selected languages
      await startTranslations({ courseId, languages });

      const taskId = await dependencies.languageToolkit.translateCourse({
        course_id: courseId,
        source_lang: originalLanguage,
        target_langs: languages,
        ...(useEnglish ? { use_english: true } : {}),
      });

      if (taskId) {
        const manifest = await dependencies.languageToolkit.pollTask(taskId);

        if (manifest) {
          await insertSlidesFromManifest(
            manifest,
            courseId,
            originalLanguage,
            dependencies,
          );
        }

        const langList = languages.map((l) => l.toLowerCase());
        await setReadyService(courseId, langList);
      }

      return { message: 'Translation started without new uploads' } as const;
    }

    // Organize files per chapter key "part.chapter"
    const chapterGroups = new Map<string, ChapterGroup>();

    for (const file of files) {
      const relativePath = file.originalFilename ?? (file as any).newFilename;
      const chapterInfo = parseChapterKey(relativePath);

      if (!chapterInfo) {
        // Skip files not matching expected pattern
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
        const stream = fs.createReadStream(pptFile.filepath);

        await dependencies.s3.upload(pptxKey, stream, {
          contentType: TRANSLATION_UPLOAD_CONSTANTS.MIME_TYPES.PPTX,
        });

        // After successful upload → convert to PNG slides via ConvertAPI
        try {
          const pptxDirPrefix = pptxKey.substring(
            0,
            pptxKey.lastIndexOf('/') + 1,
          );
          const baseNameNoExt = base.replace(/\.pptx$/i, '');
          await convertPptxToPngs(dependencies, pptxDirPrefix, baseNameNoExt);
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
    const secondTaskId = await dependencies.languageToolkit.translateCourse({
      course_id: courseId,
      source_lang: originalLanguage,
      target_langs: languages,
      ...(useEnglish ? { use_english: true } : {}),
    });

    if (secondTaskId) {
      const manifest =
        await dependencies.languageToolkit.pollTask(secondTaskId);

      if (manifest) {
        await insertSlidesFromManifest(
          manifest,
          courseId,
          originalLanguage,
          dependencies,
        );
      }

      const langList = languages.map((l) => l.toLowerCase());
      await setReadyService(courseId, langList);
    }

    return uploadResults;
  };

  router.post(
    '/translation-uploads',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;
      if (!uid) {
        return next(new InternalServerError('User session missing'));
      }

      receiveUploadForm(req)
        .then(({ courseId, languages, files: initialFiles, useEnglish }) =>
          processTranslationUpload(
            uid,
            courseId,
            languages,
            initialFiles,
            useEnglish,
          ),
        )
        .then((result) => res.json(result))
        .catch(next);
    },
  );
};
