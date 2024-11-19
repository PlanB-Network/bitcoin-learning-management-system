import { createHash } from 'node:crypto';
import { Writable } from 'node:stream';

import type { Request, Router } from 'express';
import formidable from 'formidable';
import JSZip from 'jszip';
import type { ResizeOptions } from 'sharp';
import sharp from 'sharp';

import { NoSuchKey } from '@blms/s3';
import {
  createExamTimestampService,
  createInsertFile,
  createSetProfilePicture,
} from '@blms/service-user';
import type { UserFile } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';
import { BadRequest, InternalServerError } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

const defaultResizeOptions: ResizeOptions = {
  width: 200,
  height: 200,
  withoutEnlargement: true,
};

const zipStream = (zip: JSZip) => {
  return zip.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true,
  });
};

export const createRestFilesRoutes = async (
  dependencies: Dependencies,
  router: Router,
) => {
  const insertFile = createInsertFile(dependencies);
  const receiveImage = (req: Request, resizeOptions = defaultResizeOptions) => {
    return new Promise<Omit<UserFile, 'data'>>((resolve, reject) => {
      const chunks: Buffer[] = [];

      const form = formidable({
        multiples: false,
        fileWriteStreamHandler() {
          return new Writable({
            write(chunk: Buffer, encoding, callback) {
              chunks.push(chunk);
              callback();
            },
          });
        },
      });

      try {
        form.parse<never, 'file'>(req, async (err, fields, files) => {
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

          const data = await sharp(Buffer.concat(chunks))
            .resize(resizeOptions)
            .webp() // Convert to WebP
            .toBuffer();

          const checksum = createHash('sha256').update(data).digest('hex');

          resolve(
            insertFile(req.session.uid, {
              data,
              filename: file.originalFilename,
              mimetype: 'image/webp',
              filesize: data.byteLength,
              checksum,
            }),
          );
        });
      } catch (error) {
        console.log('Error:', error);
        reject(error);
      }
    });
  };

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
        .then((file) => setProfilePicture(uid, file.id))
        .then((result) => res.json(result))
        // eslint-disable-next-line promise/no-callback-in-promise
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
      console.log('Error:', error);
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

      const pdfFile = await dependencies.s3.getBlob(`certificates/${key}.pdf`);
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
      console.log('Error:', error);
      if (error instanceof NoSuchKey) {
        res.status(404).send('Not found');
        return;
      }

      next(error);
    }
  });

  // Fetch single file from S3
  router.get('/files/:bucket/:key(*)', async (req, res, next) => {
    try {
      const { bucket, key } = req.params;

      const allowedBuckets = ['certificates', 'bcertresults', 'user-files'];
      if (!allowedBuckets.includes(bucket)) {
        res.status(401).send('Unauthorized');
        return;
      }

      const stream = await dependencies.s3.getStream(`${bucket}/${key}`);
      if (!stream) {
        res.status(404).send('Not found');
        return;
      }

      stream.pipe(res);
    } catch (error) {
      console.log('Error:', error);
      if (error instanceof NoSuchKey) {
        res.status(404).send('Not found');
        return;
      }

      next(error);
    }
  });
};
