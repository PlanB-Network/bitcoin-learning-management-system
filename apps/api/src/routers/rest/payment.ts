import type { Router } from 'express';

import { createCalculateEventSeats } from '@blms/service-content';
import {
  createUpdateCoursePayment,
  createUpdateCoursePaymentInvoiceId,
  createUpdateCoursePaymentStatus,
  createUpdateEventPayment,
  createUpdateEventPaymentInvoiceId,
  createUpdateEventPaymentStatus,
} from '@blms/service-user';
import type { SwissBitcoinPayCheckout } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

export const createRestPaymentRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  const { stripe, config } = dependencies;

  const updateCoursePayment = createUpdateCoursePayment(dependencies);
  router.post(
    '/users/courses/payment/webhooks',
    async (req, res): Promise<void> => {
      try {
        const status = req.body as SwissBitcoinPayCheckout;

        if (typeof status.id !== 'string') {
          res.status(400).json({ message: 'Invalid or missing id' });
          return;
        }

        if (status.isPaid === null || status.isExpired === null) {
          res.status(400).json({
            message:
              'Invalid isPaid or isExpired values. Must be true or false.',
          });
          return;
        }

        const result = await updateCoursePayment(status);

        res.json({
          message: 'success',
          result,
        });
      } catch (error) {
        console.error('Error in courses webhook', error);
      }
    },
  );

  const updateEventPayment = createUpdateEventPayment(dependencies);
  const calculateEventSeats = createCalculateEventSeats(dependencies);
  router.post(
    '/users/events/payment/webhooks',
    async (req, res): Promise<void> => {
      try {
        const status = req.body as SwissBitcoinPayCheckout;

        if (typeof status.id !== 'string') {
          res.status(400).json({ message: 'Invalid or missing id' });
          return;
        }

        if (status.isPaid === null || status.isExpired === null) {
          res.status(400).json({
            message:
              'Invalid isPaid or isExpired values. Must be true or false.',
          });
          return;
        }

        const result = await updateEventPayment(status);

        if (status.isPaid === true) {
          await calculateEventSeats();
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

  router.post(
    '/webhooks/stripe',
    // eslint-disable-next-line import/no-named-as-default-member
    async (req, res): Promise<void> => {
      try {
        let event = req.body;

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (config.stripe.endpointSecret) {
          const signature = req.headers['stripe-signature'] as string;

          try {
            event = stripe.webhooks.constructEvent(
              // @ts-expect-error TODO: fix this?
              req.rawBody,
              signature,
              config.stripe.endpointSecret,
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.log(
              `Webhook signature verification failed.`,
              error.message,
            );
            res.sendStatus(400);
            return;
          }
        }

        switch (event.type) {
          case 'payment_intent.succeeded': {
            console.log('=== Stripe webhook', event.type);
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const paymentId = paymentIntent.metadata.paymentId;
            const product = paymentIntent.metadata.product;

            if (product === 'course') {
              await createUpdateCoursePaymentStatus(dependencies)({
                paymentId,
                paymentIntentId,
              });
            } else if (product === 'event') {
              await createUpdateEventPaymentStatus(dependencies)({
                paymentId,
                paymentIntentId,
              });
            }

            break;
          }
          case 'invoice.paid': {
            console.log('============ Stripe webhook', event.type);

            const invoice = event.data.object;
            const intentId = invoice.payment_intent;
            const invoiceId = invoice.id;
            const hostedInvoiceUrl = invoice.hosted_invoice_url;

            const paymentIntent =
              await stripe.paymentIntents.retrieve(intentId);
            const product = paymentIntent.metadata.product;

            if (product === 'course') {
              await createUpdateCoursePaymentInvoiceId(dependencies)({
                intentId: intentId,
                stripeInvoiceId: invoiceId,
                invoiceUrl: hostedInvoiceUrl,
              });
            } else if (product === 'event') {
              await createUpdateEventPaymentInvoiceId(dependencies)({
                intentId: intentId,
                stripeInvoiceId: invoiceId,
                invoiceUrl: hostedInvoiceUrl,
              });
            }

            break;
          }
          default: {
            console.log(`Unhandled event type ${event.type}.`);
          }
        }

        res.send();
      } catch (error) {
        console.error('Error in stripe webhook', error);
      }
    },
  );

  return router;
};
