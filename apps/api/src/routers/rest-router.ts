// import crypto from 'node:crypto';
// import type { IncomingMessage } from 'node:http';

import { Router } from 'express';

import { createCalculateEventSeats } from '@sovereign-university/content';
import {
  createUpdateEventPayment,
  createUpdatePayment,
} from '@sovereign-university/user'; // Assuming this dependency is correct

import type { Dependencies } from '#src/dependencies.js';

import { syncGithubRepositories } from '../services/github/sync.js'; // Adjust the import path as needed

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

export const createRestRouter = (dependencies: Dependencies): Router => {
  const router = Router();

  router.post('/github/sync', async (req, res) => {
    try {
      const result = await syncGithubRepositories(dependencies);
      res.json(result);
    } catch (error) {
      console.error('Failed to sync GitHub repositories:', error);
      res.status(500).json({ error: 'Internal server error' });
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
      console.error('Erorr in courses webhook', error);
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
