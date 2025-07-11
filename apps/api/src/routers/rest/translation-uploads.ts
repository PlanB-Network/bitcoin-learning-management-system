import fs from 'node:fs';
import os from 'node:os';
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
import AdmZip from 'adm-zip';

import type { Router } from 'express';
import formidable from 'formidable';

import type { Dependencies } from '#src/dependencies.js';
import { BadRequest, InternalServerError } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

const mimeFromName = (name: string) =>
  name.toLowerCase().endsWith('.pptx')
    ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    : 'text/plain';

const receiveUploadForm = (req: any) => {
  return new Promise<{
    courseId: string;
    languages: string[];
    files: formidable.File[];
    useEnglish?: boolean;
  }>((resolve, reject) => {
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
          const remoteUrl = urlField.trim();
          const response = await fetch(remoteUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          // Write response body to a temp file (assume zip)
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remote-'));
          const tempZipPath = path.join(tempDir, 'download.zip');
          const arrayBuf = await response.arrayBuffer();
          fs.writeFileSync(tempZipPath, Buffer.from(arrayBuf));

          const synthetic: any = {
            filepath: tempZipPath,
            originalFilename: 'download.zip',
            mimetype: 'application/zip',
          };
          fileList.push(synthetic as formidable.File);
        } catch (e) {
          console.error('Failed to download remote zip', e);
          reject(new BadRequest('Failed to download remote zip'));
          return;
        }
      }

      // Detect .zip files, extract entries into temp dir and push as synthetic files
      const zipFiles = fileList.filter((f) =>
        f.originalFilename?.toLowerCase().endsWith('.zip'),
      );
      for (const zipFile of zipFiles) {
        try {
          const zip = new AdmZip(zipFile.filepath);
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-'));
          for (const entry of zip.getEntries()) {
            if (entry.isDirectory) continue;
            const entryPath = path.join(tempDir, entry.entryName);
            fs.mkdirSync(path.dirname(entryPath), { recursive: true });
            fs.writeFileSync(entryPath, entry.getData());

            // Create a minimal formidable.File-like object
            const synthetic: any = {
              filepath: entryPath,
              originalFilename: entry.entryName,
              mimetype: mimeFromName(entry.entryName),
            };
            fileList.push(synthetic as formidable.File);
          }
        } catch (e) {
          console.error('Failed to extract zip', e);
        }
      }
      // Remove original zip files from list
      const finalFiles = fileList.filter(
        (f) => !f.originalFilename?.toLowerCase().endsWith('.zip'),
      );

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

// --- Language Toolkit client -------------------------------------------------
const LT_BASE_URL = process.env.LT_BASE_URL ?? '';
const LT_CLIENT_ID = process.env.LT_CLIENT_ID ?? '';
const LT_CLIENT_SEC = process.env.LT_CLIENT_SECRET ?? '';

let ltAccessToken: string | null = null;
let ltTokenExpiry = 0;

async function ensureLtToken() {
  const now = Date.now();
  if (ltAccessToken && now < ltTokenExpiry - 30_000) return ltAccessToken;

  const params = new URLSearchParams();
  params.append('username', LT_CLIENT_ID);
  params.append('password', LT_CLIENT_SEC);

  const res = await fetch(`${LT_BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!res.ok) throw new Error('LT token fetch failed');
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  ltAccessToken = data.access_token;
  ltTokenExpiry = now + data.expires_in * 1000;
  return ltAccessToken;
}

async function translateCourseOnToolkit(payload: {
  course_id: string;
  source_lang: string;
  target_langs: string[];
  use_english?: boolean;
}): Promise<string | null> {
  if (!LT_BASE_URL) {
    console.warn('[LT] LT_BASE_URL not set – skipping Toolkit call');
    return null;
  }
  try {
    const token = await ensureLtToken();
    const resp = await fetch(`${LT_BASE_URL}/translate/course_s3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.error('[LT] translate/course_s3 failed', resp.status);
      return null;
    }

    const data = (await resp.json()) as { task_id?: string };
    const taskId = data.task_id ?? null;
    return taskId;
  } catch (e) {
    console.error('Language Toolkit call failed', e);
    return null;
  }
}

/**
 * Poll Toolkit tasks endpoint until status === 'completed'.
 * Returns the manifest when available, otherwise null.
 */
async function pollToolkitTask(
  taskId: string,
  {
    intervalMs = 5000,
    maxAttempts = 120, // ~10 minutes
  }: { intervalMs?: number; maxAttempts?: number } = {},
): Promise<unknown | null> {
  if (!LT_BASE_URL) return null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const token = await ensureLtToken();
      const resp = await fetch(`${LT_BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        console.error('[LT] Task poll failed', resp.status);
        return null;
      }
      const data = (await resp.json()) as {
        status: 'pending' | 'completed' | string;
        manifest?: unknown;
      };
      if (data.status === 'completed') {
        return data.manifest ?? null;
      }
    } catch (err) {
      console.error('[LT] Error polling task', err);
      return null;
    }
    // Wait before next poll
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.warn('[LT] Task polling timed out');
  return null;
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

  router.post(
    '/translation-uploads',
    expressAuthMiddleware,
    async (req, res, next) => {
      const uid = req.session.uid;
      if (!uid) {
        return next(new InternalServerError('User session missing'));
      }

      try {
        const {
          courseId,
          languages,
          files: initialFiles,
          useEnglish: useEnglishOverride,
        } = await receiveUploadForm(req);

        // Check existing uploads for this course
        const existingUploads = await getUploadsService(courseId);

        // Get original language once (needed whether or not we upload files)
        const originalLanguage = await getCourseOriginalLang(courseId);
        if (!originalLanguage) {
          throw new InternalServerError('Course not found');
        }

        // Determine if we should use English as the intermediate language
        const enTranslations = await getAvailableCourseTranslations(
          'en',
          courseId,
        );
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

          const taskId = await translateCourseOnToolkit({
            course_id: courseId,
            source_lang: originalLanguage,
            target_langs: languages,
            ...(useEnglish ? { use_english: true } : {}),
          });

          if (taskId) {
            const manifest = await pollToolkitTask(taskId);

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

          res.json({ message: 'Translation started without new uploads' });
          return;
        }

        // Organise files per chapter key "part.chapter"
        interface ChapterGroup {
          pptx?: formidable.File;
          txts: formidable.File[];
        }
        const chapterGroups = new Map<string, ChapterGroup>();

        const pathSeparator = /[\\/]/;

        for (const file of files) {
          const relativePath = file.originalFilename ?? file.newFilename;
          const segments = relativePath.split(pathSeparator);

          let partIndex: number | null = null;
          let chapterIndex: number | null = null;

          // Try to find a directory segment like "1.2"
          const partChapSegment = segments.find((s) => /^\d+\.\d+$/.test(s));
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

        const uploadResults = [];

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

            await updateUpload(
              uploadRecord.id,
              pptxKey,
              txtKey,
              true,
              undefined,
            );
            uploadResults.push(uploadRecord);
          }
        }

        // Start translations for selected languages
        await startTranslations({ courseId, languages });

        // Call Language Toolkit to trigger translation
        const secondTaskId = await translateCourseOnToolkit({
          course_id: courseId,
          source_lang: originalLanguage,
          target_langs: languages,
          ...(useEnglish ? { use_english: true } : {}),
        });

        if (secondTaskId) {
          const manifest = await pollToolkitTask(secondTaskId);

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

        res.json(uploadResults);
      } catch (error) {
        next(error);
      }
    },
  );
};
