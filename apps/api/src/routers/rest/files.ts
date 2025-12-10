import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { NoSuchKey } from '@blms/s3';
import {
  createGetEducatorContent,
  createIncrementEducatorContentDownloads,
} from '@blms/service-content';
import {
  createExamTimestampService,
  createSetProfilePicture,
} from '@blms/service-user';
import type { Request, Router } from 'express';
import formidable from 'formidable';
import JSZip from 'jszip';
import type { ResizeOptions } from 'sharp';
import sharp from 'sharp';

import type { Dependencies } from '#src/dependencies.js';
import { BadRequest, InternalServerError } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

const defaultResizeOptions: ResizeOptions = {
  height: 200,
  width: 200,
  withoutEnlargement: true,
};

const zipStream = (zip: JSZip) => {
  return zip.generateNodeStream({
    streamFiles: true,
    type: 'nodebuffer',
  });
};

const receiveImage = (req: Request, resizeOptions = defaultResizeOptions) => {
  return new Promise<Readable>((resolve, reject) => {
    const sharpStream = sharp().resize(resizeOptions).webp();

    const form = formidable({
      fileWriteStreamHandler: () => sharpStream,
      multiples: false,
    });

    try {
      form.parse<never, 'file'>(req, (err, _fields, files) => {
        if (err) {
          throw new InternalServerError('Failed to parse form data');
        }

        if (files.file?.length !== 1) {
          throw new BadRequest('Invalid number of files');
        }

        const [file] = files.file;

        // Sanity check
        if (!req.session.uid) {
          throw new InternalServerError('Missing session uid');
        }

        if (!file.mimetype) {
          throw new InternalServerError('Missing file mimetype');
        }

        if (!file.originalFilename) {
          throw new InternalServerError('Missing file name');
        }

        resolve(sharpStream);
      });
    } catch (error) {
      req.log('Error:', error);
      reject(error);
    }
  });
};

const receivePdf = (req: Request) => {
  return new Promise<Readable>((resolve, reject) => {
    const form = formidable({
      multiples: false,
    });

    try {
      form.parse<never, 'file'>(req, (err, _, files) => {
        if (err) {
          throw new InternalServerError('Failed to parse form data');
        }

        if (files.file?.length !== 1) {
          throw new BadRequest('Invalid number of files');
        }

        const [file] = files.file;

        // Sanity check
        if (!req.session.uid) {
          throw new InternalServerError('Missing session uid');
        }

        if (!file.mimetype) {
          throw new InternalServerError('Missing file mimetype');
        }

        if (file.mimetype !== 'application/pdf') {
          throw new BadRequest('Invalid file type');
        }

        if (!file.originalFilename) {
          throw new InternalServerError('Missing file name');
        }

        // Size limit
        if (file.size > 10 * 1024 * 1024) {
          throw new BadRequest('File too large');
        }

        // Validate file is within the OS temp directory (formidable default)
        const tempDir = os.tmpdir();
        let resolvedPath: string;
        try {
          resolvedPath = fs.realpathSync(path.resolve(file.filepath));
        } catch (_e) {
          throw new BadRequest('Invalid file path');
        }
        if (!resolvedPath.startsWith(path.resolve(tempDir))) {
          throw new BadRequest('Disallowed file path');
        }
        const fileStream = fs.createReadStream(resolvedPath);
        resolve(fileStream);
      });
    } catch (error) {
      req.log('Error:', error);
      reject(error);
    }
  });
};

const receiveGenericFile = (req: Request) => {
  return new Promise<{
    stream: Readable;
    mimetype: string;
    originalFilename: string;
  }>((resolve, reject) => {
    const form = formidable({
      multiples: false,
    });

    try {
      form.parse<never, 'file'>(req, (err, _, files) => {
        if (err) {
          throw new InternalServerError('Failed to parse form data');
        }

        if (files.file?.length !== 1) {
          throw new BadRequest('Invalid number of files');
        }

        const [file] = files.file;

        // Sanity check
        if (!req.session.uid) {
          throw new InternalServerError('Missing session uid');
        }

        if (!file.mimetype) {
          throw new InternalServerError('Missing file mimetype');
        }

        if (!file.originalFilename) {
          throw new InternalServerError('Missing file name');
        }

        // Size limit (50MB)
        if (file.size > 50 * 1024 * 1024) {
          throw new BadRequest('File too large');
        }

        // Validate file is within the OS temp directory (formidable default)
        const tempDir = os.tmpdir();
        let resolvedPath: string;
        try {
          resolvedPath = fs.realpathSync(path.resolve(file.filepath));
        } catch (_e) {
          throw new BadRequest('Invalid file path');
        }
        if (!resolvedPath.startsWith(path.resolve(tempDir))) {
          throw new BadRequest('Disallowed file path');
        }
        const fileStream = fs.createReadStream(resolvedPath);

        resolve({
          stream: fileStream,
          mimetype: file.mimetype,
          originalFilename: file.originalFilename,
        });
      });
    } catch (error) {
      req.log('Error:', error);
      reject(error);
    }
  });
};

export const createRestFilesRoutes = async (
  dependencies: Dependencies,
  router: Router,
) => {
  const setProfilePicture = createSetProfilePicture(dependencies);
  router.post(
    '/user-file/profile-picture',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;

      // Sanity check
      if (!uid) {
        throw new InternalServerError('Missing session uid');
      }

      receiveImage(req)
        .then((stream) => {
          const id = randomUUID();

          return dependencies.s3
            .upload(`user-files/${id}`, stream, { contentType: 'image/webp' })
            .then(() => id);
        })
        .then((fileId) => setProfilePicture(uid, fileId))
        .then((result) => res.json(result))
        .catch(next);
    },
  );

  router.post(
    '/educator-content/cover',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;

      // Sanity check
      if (!uid) {
        throw new InternalServerError('Missing session uid');
      }

      receiveImage(req, { width: 1200, height: 630, fit: 'cover' })
        .then((stream) => {
          const id = randomUUID();

          return dependencies.s3
            .upload(`contribute/cover/${id}`, stream, {
              contentType: 'image/webp',
            })
            .then(() => id);
        })
        .then((fileId) => res.json({ id: fileId }))
        .catch(next);
    },
  );

  router.post(
    '/educator-content/file',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;

      // Sanity check
      if (!uid) {
        throw new InternalServerError('Missing session uid');
      }

      receiveGenericFile(req)
        .then(({ stream, mimetype }) => {
          const id = randomUUID();

          return dependencies.s3
            .upload(`contribute/educator-content/${id}`, stream, {
              contentType: mimetype,
            })
            .then(() => id);
        })
        .then((fileId) => res.json({ id: fileId }))
        .catch(next);
    },
  );

  router.get('/educator-content/download-all/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const getEducatorContent = createGetEducatorContent(dependencies as any);
      const content = await getEducatorContent(undefined, undefined, id);
      const item = content[0];

      if (!item || !item.files || item.files.length === 0) {
        res.status(404).send('No files found');
        return;
      }

      // Increment download count
      const incrementDownloads = createIncrementEducatorContentDownloads(
        dependencies as any,
      );
      await incrementDownloads(item.id);
      const zip = new JSZip();
      await Promise.all(
        item.files.map(async (file) => {
          const blob = await dependencies.s3.getBlob(
            `contribute/educator-content/${file.path}`,
          );
          if (blob) {
            zip.file(file.name, blob);
          }
        }),
      );

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${item.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()}_files.zip"`,
      );
      zipStream(zip).pipe(res);
    } catch (error) {
      next(error);
    }
  });

  router.post('/career/cvs/:key', expressAuthMiddleware, (req, res, next) => {
    const { key } = req.params;

    // Sanity check
    if (!req.session.uid) {
      throw new InternalServerError('Missing session uid');
    }
    if (!key) {
      throw new BadRequest('Missing key');
    }

    receivePdf(req)
      .then((stream) => {
        return dependencies.s3.upload(`cvs/${key}`, stream, {
          contentType: 'application/pdf',
        });
      })
      .then(() => res.json())
      .catch(next);
  });

  router.post(
    '/course-assignments/submit/:courseId/:key',
    expressAuthMiddleware,
    (req, res, next) => {
      const { courseId, key } = req.params;

      // Sanity check
      if (!req.session.uid) {
        throw new InternalServerError('Missing session uid');
      }
      if (!courseId || !key) {
        throw new BadRequest('Missing courseId or key');
      }

      receivePdf(req)
        .then((stream) => {
          return dependencies.s3.upload(
            `course-assignments/${courseId}/submitted/${key}`,
            stream,
            {
              contentType: 'application/pdf',
            },
          );
        })
        .then(() => res.json())
        .catch(next);
    },
  );

  // Get all B-Cert files in a zip; typical key will be <exam-id>/<user-id>
  router.get('/files/zip/bcert/:edition/:username', async (req, res, next) => {
    try {
      const { edition, username } = req.params;
      const key = `${edition}/${username}`;

      const keys = [
        `bcertresults/${key}/bitcoin_certificate-signed.pdf`,
        `bcertresults/${key}/bitcoin_certificate-signed.txt`,
        `bcertresults/${key}/bitcoin_certificate-signed.txt.ots`,
      ];

      const [pdfFile, txtFile, otsFile] = await Promise.all(
        keys.map((key) => dependencies.s3.getBlob(key)),
      );

      if (!pdfFile || !txtFile || !otsFile) {
        res.status(404).send('Not found');
        return;
      }

      const zip = new JSZip();

      zip.file('certificate.pdf', pdfFile);
      zip.file('certificate.txt', txtFile);
      zip.file('certificate.txt.ots', otsFile);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="bcert.zip"`);

      zipStream(zip).pipe(res);
    } catch (error) {
      req.log('Error:', error);
      if (error instanceof NoSuchKey) {
        res.status(404).send('Not found');
        return;
      }

      next(error);
    }
  });

  const timeStampService = await createExamTimestampService(dependencies);

  // Get zip for certificates
  router.get('/files/zip/diplomas/:key', async (req, res, next) => {
    try {
      const { key } = req.params;

      const timestamp = await timeStampService!.getExamTimestamp(key);

      let pdfFile: any;
      try {
        pdfFile = await dependencies.s3.getBlob(
          `certificates/${timestamp.id}.pdf`,
        );
      } catch (error) {
        if (error instanceof NoSuchKey) {
          pdfFile = await dependencies.s3.getBlob(
            `certificates/${timestamp.examAttemptId}.pdf`,
          );
        } else {
          throw error;
        }
      }

      const otsFile = timestamp.ots;
      const txtFile = timestamp.txt;

      if (!pdfFile || !otsFile || !txtFile) {
        res.status(404).send('Not found');
        return;
      }

      const zip = new JSZip();

      zip.file('diploma.pdf', pdfFile);
      zip.file('diploma.txt', txtFile);
      zip.file('diploma.txt.ots', otsFile);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="diploma.zip"`,
      );

      zipStream(zip).pipe(res);
    } catch (error) {
      req.log('Error:', error);
      if (error instanceof NoSuchKey) {
        res.status(404).send('Not found');
        return;
      }

      next(error);
    }
  });

  // Fetch single file from S3
  router.get('/files/:dir/:key(*)', async (req, res, next) => {
    try {
      const { dir, key } = req.params;

      const allowedBuckets = [
        'certificates',
        'course-assignments',
        'bcertresults',
        'user-files',
        'cvs',
        'contribute',
        'resources',
      ];
      if (!allowedBuckets.includes(dir)) {
        res.status(401).send('Unauthorized');
        return;
      }

      const stream = await dependencies.s3.getStream(`${dir}/${key}`);
      if (!stream) {
        res.status(404).send('Not found');
        return;
      }

      stream.pipe(res);
    } catch (error) {
      req.log('Error:', error);
      if (error instanceof NoSuchKey) {
        res.status(404).send('Not found');
        return;
      }

      next(error);
    }
  });
};
