/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import crypto from 'node:crypto';
// import type { IncomingMessage } from 'node:http';

import { createHash } from 'node:crypto';
import { Writable } from 'node:stream';

import { Router } from 'express';
import type { Request } from 'express';
import formidable from 'formidable';
import type { ResizeOptions } from 'sharp';
import sharp from 'sharp';

import { createCalculateEventSeats } from '@sovereign-university/content';
import type { UserFile } from '@sovereign-university/types';
import {
  createGetUserFile,
  createInsertFile,
  createSetProfilePicture,
  createUpdateEventPayment,
  createUpdatePayment,
} from '@sovereign-university/user'; // Assuming this dependency is correct

import type { Dependencies } from '#src/dependencies.js';
import { BadRequest, InternalServerError } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

import { createSyncGithubRepositories } from '../services/github/sync.js'; // Adjust the import path as needed

// const sigHashAlg = 'sha256';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const validateHmacSignature = (req: IncomingMessage) => {
//   // @ts-expect-error TODO: fix this?
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   const rawBody = req.rawBody;
//   const hmac = crypto.createHmac(
//     'sha256',
//     process.env['SBP_HMAC_SECRET'] as string,
//   );
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
//   const hex = sigHashAlg + '=' + hmac.update(rawBody).digest('hex');
//   console.log('==hex:', hex);
//   console.log('==sbp:', req.headers['sbp-sig']);

//   return hex === req.headers['sbp-sig'];
// };

const defaultResizeOptions: ResizeOptions = {
  width: 200,
  height: 200,
  withoutEnlargement: true,
};

export const createRestRouter = (dependencies: Dependencies): Router => {
  const router = Router();
  const syncGithubRepositories = createSyncGithubRepositories(dependencies);

  router.post('/github/sync', async (req, res) => {
    try {
      const result = await syncGithubRepositories();
      res.json(result);
    } catch (error) {
      console.error('Failed to sync GitHub repositories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

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
        reject(error);
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const setProfilePicture = createSetProfilePicture(dependencies);
  router.post(
    '/user/profile-picture',
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const getFileData = createGetUserFile(dependencies);
  router.get('/file/:id', async (req, res, next) => {
    try {
      const file: UserFile = await getFileData(req.params.id);

      res.setHeader('Content-Type', file.mimetype);
      res.setHeader('Content-Length', file.filesize.toString());

      res.end(file.data);
    } catch (error) {
      next(error);
    }
  });

  router.post('/users/courses/payment/webhooks', async (req, res) => {
    try {
      interface PaymentWebhookRequest {
        id: string;
        isPaid: boolean;
        isExpired: boolean;
      }

      // if (!validateHmacSignature(req)) {
      //   console.error('Hmac validation error!');

      //   res.statusCode = 403;
      //   res.json({
      //     message: 'hmac validation error',
      //   });
      //   res.end();
      //   return;
      // }

      const { id, isPaid, isExpired } = req.body as PaymentWebhookRequest;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing id' });
      }

      if (isPaid === null || isExpired === null) {
        return res.status(400).json({
          message: 'Invalid isPaid or isExpired values. Must be true or false.',
        });
      }

      const result = await createUpdatePayment(dependencies)({
        id: id,
        isPaid: isPaid,
        isExpired: isExpired,
      });

      res.json({
        message: 'success',
        result,
      });
    } catch (error) {
      console.error('Error in courses webhook', error);
    }
  });

  router.post('/users/events/payment/webhooks', async (req, res) => {
    try {
      interface PaymentWebhookRequest {
        id: string;
        isPaid: boolean;
        isExpired: boolean;
      }

      // if (!validateHmacSignature(req)) {
      //   console.error('Hmac validation error!');

      //   res.statusCode = 403;
      //   res.json({
      //     message: 'hmac validation error',
      //   });
      //   res.end();
      //   return;
      // }

      console.log(req.body);

      const { id, isPaid, isExpired } = req.body as PaymentWebhookRequest;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing id' });
      }

      if (isPaid === null || isExpired === null) {
        return res.status(400).json({
          message: 'Invalid isPaid or isExpired values. Must be true or false.',
        });
      }

      const result = await createUpdateEventPayment(dependencies)({
        id: id,
        isPaid: isPaid,
        isExpired: isExpired,
      });

      if (isPaid === true) {
        await createCalculateEventSeats(dependencies)();
        const { redis } = dependencies;
        await redis.del('trpc:content.getEvent*');
      }

      res.json({
        message: 'success',
        result,
      });
    } catch (error) {
      console.error('Erorr in events webhook', error);
    }
  });

  return router;
};
