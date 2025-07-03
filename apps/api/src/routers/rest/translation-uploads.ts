import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import type { Readable } from 'node:stream';

import type { Router } from 'express';
import formidable from 'formidable';

import {
  createCreateCourseTranslationUpload,
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

export const createRestTranslationUploadRoutes = async (
  dependencies: Dependencies,
  router: Router,
) => {
  const createUpload = createCreateCourseTranslationUpload(dependencies as any);
  const updateUpload = createUpdateCourseTranslationUpload(dependencies as any);
  const startTranslations = createStartTranslations(dependencies as any);

  router.post(
    '/translation-uploads',
    expressAuthMiddleware,
    async (req, res, next) => {
      const uid = req.session.uid;
      if (!uid) {
        return next(new InternalServerError('User session missing'));
      }

      try {
        const { courseId, languages, pptxFile, audioFile } =
          await receiveUploadForm(req);

        // Fetch original language from courses table
        const [{ originalLanguage }] = await dependencies.postgres.exec(
          dependencies.postgres`SELECT original_language FROM content.courses WHERE id = ${courseId} LIMIT 1` as any,
        );
        if (!originalLanguage) {
          throw new InternalServerError('Course not found');
        }

        const uploadId = randomUUID();

        // Function to build key using original language
        const buildKey = (type: 'pptx' | 'audio', filename: string) =>
          `contribute/${courseId}/${originalLanguage}/${type}/${uploadId}_${filename}`;

        // Upload files once (original language path)
        let pptxKey: string | undefined;
        let audioKey: string | undefined;

        if (pptxFile) {
          const stream: Readable = fs.createReadStream(pptxFile.filepath);
          const key = buildKey(
            'pptx',
            pptxFile.originalFilename ?? 'upload.pptx',
          );
          pptxKey = key;
          await dependencies.s3.upload(key, stream, {
            contentType:
              pptxFile.mimetype ||
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          });
        }

        if (audioFile) {
          const stream: Readable = fs.createReadStream(audioFile.filepath);
          const key = buildKey(
            'audio',
            audioFile.originalFilename ?? 'upload.audio',
          );
          audioKey = key;
          await dependencies.s3.upload(key, stream, {
            contentType: audioFile.mimetype || 'audio/mpeg',
          });
        }

        // Record upload in DB (initially upload_success = false by default)
        const uploadRecord = await createUpload(
          courseId,
          originalLanguage,
          languages,
          uid,
          pptxKey,
          audioKey,
        );

        // Mark the upload as successful now that both files (if any) are stored
        const updatedRecord = await updateUpload(
          uploadRecord.id,
          pptxKey,
          audioKey,
          true, // uploadSuccess = true
          undefined, // errorMessage
        );

        // Start translations (todo -> in_progress) and auto-create missing rows
        await startTranslations({ courseId, languages });

        res.json(updatedRecord);
      } catch (error) {
        next(error);
      }
    },
  );
};
