// import crypto from 'node:crypto';
// import type { IncomingMessage } from 'node:http';

import type { Router } from 'express';

import { createCalculateEventSeats } from '@blms/service-content';
import {
  createUpdateEventPayment,
  createUpdatePayment,
} from '@blms/service-user';

import type { Dependencies } from '#src/dependencies.js';

export const createRestPaymentRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
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

  return router;
};
