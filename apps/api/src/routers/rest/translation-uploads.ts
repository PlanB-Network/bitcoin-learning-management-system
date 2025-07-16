import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import type { Readable } from 'node:stream';

import type { Router } from 'express';
import formidable from 'formidable';

import {
  createStartTranslations,
  createUpdateCourseTranslationUpload,
} from '@blms/service-content';

import type { Dependencies } from '#src/dependencies.js';
import { BadRequest, InternalServerError } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

const receiveUploadForm = (req: any) => {
  return new Promise<{
    courseId: string;
    languages: string[];
    pptxFile?: formidable.File;
    audioFile?: formidable.File;
  }>((resolve, reject) => {
    const form = formidable({ multiples: true });

    form.parse(req, (err, fields, files) => {
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

      const pptxFile = files.pptxFile
        ? Array.isArray(files.pptxFile)
          ? (files.pptxFile[0] as formidable.File | undefined)
          : (files.pptxFile as formidable.File | undefined)
        : undefined;

      const audioFile = files.audioFile
        ? Array.isArray(files.audioFile)
          ? (files.audioFile[0] as formidable.File | undefined)
          : (files.audioFile as formidable.File | undefined)
        : undefined;

      resolve({
        courseId: courseId as string,
        languages,
        pptxFile,
        audioFile,
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

          // Derive slide number from filename part after '_'
          let slideNumber = 0;
          try {
            const match = /_(\d+)\./.exec(textFile);
            if (match) slideNumber = Number(match[1]);
          } catch {}

          // Build S3 keys for original and translated text and pptx
          const translatedPptKey = pptxFile
            ? `contribute/${courseId}/${langKey}/${partId}/${chapterId}/${slideId}/pptx/${pptxFile}`
            : null;
          const translatedTextKey = `contribute/${courseId}/${langKey}/${partId}/${chapterId}/${slideId}/text/${textFile}`;
          const originalTextKey = `contribute/${courseId}/${originalLanguage}/${partId}/${chapterId}/text/${textFile}`;

          // Helper to safely fetch blob, returning null if key not found
          const safeGetBlob = async (key: string | null) => {
            if (!key) return null;
            try {
              return await dependencies.s3.getBlob(key);
            } catch (err: any) {
              if (err?.name === 'NoSuchKey') {
                return null;
              }
              console.error('[S3] Error fetching key', key, err);
              return null;
            }
          };

          const MAX_RETRIES = 6;
          const RETRY_DELAY_MS = 3000;

          let [origBlob, transBlob] = await Promise.all([
            safeGetBlob(originalTextKey),
            safeGetBlob(translatedTextKey),
          ]);

          let attempt = 0;
          while ((!origBlob || !transBlob) && attempt < MAX_RETRIES) {
            attempt += 1;
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            if (!origBlob) origBlob = await safeGetBlob(originalTextKey);
            if (!transBlob) transBlob = await safeGetBlob(translatedTextKey);
          }

          if (!origBlob || !transBlob) {
            console.warn('[UPLOAD] Missing slide content after retries', {
              courseId,
              lang: langKey,
              partId,
              chapterId,
              slideId,
              originalKey: originalTextKey,
              translatedKey: translatedTextKey,
              pptKey: translatedPptKey,
              missingOriginal: !origBlob,
              missingTranslated: !transBlob,
              attempts: attempt,
            });
          }

          const toStr = (b: Uint8Array | null) =>
            b ? Buffer.from(b).toString('utf-8') : null;

          const originalContent = toStr(origBlob);
          const translatedContent = toStr(transBlob);

          await insertSlide(
            courseId,
            langKey,
            partId,
            chapterId,
            slideId,
            slideNumber,
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

    // Organise files per chapter key "part.chapter"
    interface ChapterGroup {
      pptx?: formidable.File;
      txts: formidable.File[];
    }
    const chapterGroups = new Map<string, ChapterGroup>();

    const pathSeparator = /[\\/]/;

    for (const file of files) {
      const relativePath = file.originalFilename ?? (file as any).newFilename;
      const segments = relativePath.split(pathSeparator);

      let partIndex: number | null = null;
      let chapterIndex: number | null = null;

      // Try to find a directory segment like "1.2"
      const partChapSegment = segments.find((s: string) =>
        /^\d+\.\d+$/.test(s),
      );
      if (partChapSegment) {
        const m = /^(\d+)\.(\d+)$/.exec(partChapSegment);
        if (m) {
          partIndex = Number(m[1]);
          chapterIndex = Number(m[2]);
        }
      }

      // Fallback: look at the filename itself (before first underscore or dot)
      if (partIndex === null || chapterIndex === null) {
        const baseName = segments[segments.length - 1]; // e.g. 1.2_0.txt
        const m2 = /^(\d+)\.(\d+)/.exec(baseName);
        if (m2) {
          partIndex = Number(m2[1]);
          chapterIndex = Number(m2[2]);
        }
      }

      if (partIndex === null || chapterIndex === null) {
        // Skip files not matching expected pattern
        continue;
      }

      const key = `${partIndex}.${chapterIndex}`;

      let group = chapterGroups.get(key);
      if (!group) {
        group = { txts: [] };
        chapterGroups.set(key, group);
      }

      if (
        file.mimetype?.includes('presentation') ||
        file.originalFilename?.endsWith('.pptx')
      ) {
        group.pptx = file;
      } else if (
        file.mimetype?.startsWith('text') ||
        file.originalFilename?.endsWith('.txt')
      ) {
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
      } catch (err) {
        // Skip chapters that don't exist in DB
        console.warn(
          `Skipping upload for unmapped part ${partIndex} chapter ${chapterIndex}`,
        );
        continue;
      }

      // Build base key path helper
      const buildKey = (
        type: 'pptx' | 'text',
        partId: string,
        chapterId: string,
        filename: string,
      ) =>
        `contribute/${courseId}/${originalLanguage}/${partId}/${chapterId}/${type}/${filename}`;

      let pptxKey: string | undefined;

      // upload pptx once per chapter (or skip if absent)
      if (group.pptx) {
        const pptFile = group.pptx;
        const base = (pptFile.originalFilename ?? 'upload.pptx')
          .split(pathSeparator)
          .pop()!;
        pptxKey = buildKey('pptx', partId, chapterId, base);
        const stream = fs.createReadStream(pptFile.filepath);

        await dependencies.s3.upload(pptxKey, stream, {
          contentType:
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
      }

      // each txt => one DB row
      for (const txt of group.txts) {
        const baseTxt = (txt.originalFilename ?? 'slide.txt')
          .split(pathSeparator)
          .pop()!;
        const txtKey = buildKey('text', partId, chapterId, baseTxt);
        const stream = fs.createReadStream(txt.filepath);

        await dependencies.s3.upload(txtKey, stream, {
          contentType: 'text/plain',
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
