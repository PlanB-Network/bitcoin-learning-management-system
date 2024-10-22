// import crypto from 'node:crypto';
// import type { IncomingMessage } from 'node:http';

import { createHash } from 'node:crypto';
import { Writable } from 'node:stream';

import { Router } from 'express';
import type { Request } from 'express';
import formidable from 'formidable';
import type { ResizeOptions } from 'sharp';
import sharp from 'sharp';

import {
  createCalculateEventSeats,
  createGetMetadata,
} from '@blms/service-content';
import {
  createGetUserFile,
  createInsertFile,
  createSetProfilePicture,
  createUpdateEventPayment,
  createUpdatePayment,
} from '@blms/service-user'; // Assuming this dependency is correct
import type { UserFile } from '@blms/types';

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

// Encode a string to url-safe base64
const b64enc = (value: string) => btoa(encodeURIComponent(value));

export const createRestRouter = (dependencies: Dependencies): Router => {
  const router = Router();
  const redis = dependencies.redis;
  const syncGithubRepositories = createSyncGithubRepositories(dependencies);
  const getMetadata = createGetMetadata(dependencies);

  router.post('/github/sync', async (req, res): Promise<void> => {
    if (await redis.get('github-sync-locked')) {
      res.status(409).json({ error: 'Already syncing' });
      return;
    } else {
      await redis.set('github-sync-locked', true);
    }

    try {
      const result = await syncGithubRepositories();
      res.json(result);
    } catch (error) {
      console.error('Failed to sync GitHub repositories:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      void redis.set('github-sync-locked', false);
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

  router.get('/files/certificates/:fileName', async (req, res) => {
    const fileName = req.params.fileName;

    const stream = await dependencies.s3.getStream(`certificates/${fileName}`);

    if (!stream) {
      res.status(404).send('Not found');
      return;
    }

    stream.pipe(res);
  });

  router.post(
    '/users/courses/payment/webhooks',
    async (req, res): Promise<void> => {
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
          res.status(400).json({ message: 'Invalid or missing id' });
          return;
        }

        if (isPaid === null || isExpired === null) {
          res.status(400).json({
            message:
              'Invalid isPaid or isExpired values. Must be true or false.',
          });
          return;
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
    },
  );

  router.post(
    '/users/events/payment/webhooks',
    async (req, res): Promise<void> => {
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
          res.status(400).json({ message: 'Invalid or missing id' });
          return;
        }

        if (isPaid === null || isExpired === null) {
          res.status(400).json({
            message:
              'Invalid isPaid or isExpired values. Must be true or false.',
          });
          return;
        }

        const result = await createUpdateEventPayment(dependencies)({
          id: id,
          isPaid: isPaid,
          isExpired: isExpired,
        });

        if (isPaid === true) {
          await createCalculateEventSeats(dependencies)();
        }

        res.json({
          message: 'success',
          result,
        });
      } catch (error) {
        console.error('Error in events webhook', error);
      }
    },
  );

  // curl "localhost:3000/api/metadata?uri=/" -I
  router.get('/metadata', async (req, res) => {
    try {
      const proto = (req.headers['x-forwarded-proto'] as string) ?? 'http';
      const host = req.headers['host'] as string;

      const url = new URL(`${proto}://${host}${req.query.uri as string}`);
      const parts = url.pathname.split('/').filter(Boolean);

      console.log(`Metadata query`, url.toString());
      const metadata = await getMetadata(parts);
      const imageUrl = dependencies.config.domainUrl + metadata.image;

      res.setHeader('X-Title', b64enc(metadata.title));
      res.setHeader('X-Description', b64enc(metadata.description));
      res.setHeader('X-Locale', metadata.lang);
      res.setHeader('X-Image', imageUrl);
      res.setHeader('X-Type', 'website');

      res.status(204).end();
    } catch (error) {
      console.error('Error resolving metadata', error);
      res.status(204).end();
    }
  });

  return router;
};
