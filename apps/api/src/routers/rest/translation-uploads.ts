import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import AdmZip from 'adm-zip';

import type { Router } from 'express';
import formidable from 'formidable';

import {
  createCreateCourseTranslationUpload,
  createGetPartAndChapterIds,
  createStartTranslations,
  createUpdateCourseTranslationUpload,
} from '@blms/service-content';

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

      if (finalFiles.length === 0) {
        reject(new BadRequest('No files provided'));
        return;
      }

      resolve({
        courseId: courseId as string,
        languages,
        files: finalFiles,
      });
    });
  });
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
        } = await receiveUploadForm(req);

        const files = initialFiles;

        // Get original language once
        const [{ originalLanguage }] = await dependencies.postgres.exec(
          dependencies.postgres`SELECT original_language FROM content.courses WHERE id = ${courseId} LIMIT 1` as any,
        );
        if (!originalLanguage) {
          throw new InternalServerError('Course not found');
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

          // find any segment matching "digit.digit"
          const partChapSegment = segments.find((s) => /^\d+\.\d+$/.test(s));
          if (!partChapSegment) continue;

          const match = /^(\d+)\.(\d+)$/.exec(partChapSegment);
          if (!match) continue; // skip files not in expected dir

          const partIndex = Number(match[1]);
          const chapterIndex = Number(match[2]);
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

        res.json(uploadResults);
      } catch (error) {
        next(error);
      }
    },
  );
};
