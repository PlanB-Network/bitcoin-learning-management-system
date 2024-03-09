import crypto from 'crypto';
import { Router } from 'express';

import { createUpdatePayment } from '@sovereign-university/user'; // Assuming this dependency is correct

import type { Dependencies } from '#src/dependencies.js';

import { syncGithubRepositories } from '../services/github/sync.js'; // Adjust the import path as needed
import { IncomingMessage } from 'http';

const sigHashAlg = 'sha256';

const validateHmacSignature = (req: IncomingMessage) => {
  // @ts-ignore
  const rawBody = req.rawBody;

  const hmac = crypto.createHmac(
    'sha256',
    process.env['SBP_HMAC_SECRET'] as string,
  );
  const hex = sigHashAlg + '=' + hmac.update(rawBody).digest('hex');

  return hex === req.headers['sbp-sig'];
};

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
    interface PaymentWebhookRequest {
      id: string;
      isPaid: boolean;
      isExpired: boolean;
    }

    if (!validateHmacSignature(req)) {
      console.error('Hmac validation error!');

      res.statusCode = 403;
      res.json({
        message: 'hmac validation error',
      });
      res.end();
      return;
    }

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
  });

  return router;
};
