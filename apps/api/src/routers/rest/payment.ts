import { createCalculateEventSeats } from '@blms/service-content';
import {
  createHandleSbpWebhook,
  createUpdateCoursePaymentInvoiceId,
  createUpdateCoursePaymentStatus,
  createUpdateEventPaymentInvoiceId,
  createUpdateEventPaymentStatus,
  createUpdateGeneralPaymentInvoiceId,
  createUpdateGeneralPaymentStatus,
  isValidSbpSignature,
  type SbpPaymentType,
} from '@blms/service-user';
import type { Request, Response, Router } from 'express';
import type Stripe from 'stripe';

import type { Dependencies } from '#src/dependencies.js';

const sbpWebhookTypes: SbpPaymentType[] = ['courses', 'events', 'general'];

export const createRestPaymentRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  const { stripe, config } = dependencies;

  const handleSbpWebhook = createHandleSbpWebhook(dependencies);
  const calculateEventSeats = createCalculateEventSeats(dependencies);

  // PAYMENTS_DISABLED kill switch: no provider event is processed
  const refusedWhilePaymentsDisabled = (req: Request, res: Response) => {
    if (!config.paymentsDisabled) {
      return false;
    }
    req.log(`Payment webhook refused: payments are disabled (${req.path})`);
    res.sendStatus(503);
    return true;
  };

  // SwissBitcoinPay webhooks (courses, events and general payments).
  // The body is untrusted: only the checkout id is read from it, the payment
  // status and amount are fetched back from SwissBitcoinPay.
  for (const type of sbpWebhookTypes) {
    router.post(
      `/users/${type}/payment/webhooks`,
      async (req, res): Promise<void> => {
        if (refusedWhilePaymentsDisabled(req, res)) {
          return;
        }

        const { hmacSecret } = config.swissBitcoinPay;
        if (
          hmacSecret &&
          !isValidSbpSignature(req.rawBody, req.header('sbp-sig'), hmacSecret)
        ) {
          req.log(`SBP ${type} webhook refused: invalid signature`);
          res.sendStatus(401);
          return;
        }

        const id = req.body?.id;
        if (typeof id !== 'string' || !/^[\w-]{1,128}$/.test(id)) {
          res.status(400).json({ message: 'Invalid or missing id' });
          return;
        }

        try {
          const result = await handleSbpWebhook(type, id);
          req.log(`SBP ${type} webhook`, id, result);

          if (type === 'events' && result.outcome === 'paid') {
            await calculateEventSeats();
          }

          // Same answer whatever the outcome, so callers cannot probe which
          // payment ids exist
          res.json({ message: 'success' });
        } catch (error) {
          req.log(`Error in SBP ${type} webhook`, error);
          res.sendStatus(500);
        }
      },
    );
  }

  router.post('/webhooks/stripe', async (req, res): Promise<void> => {
    if (refusedWhilePaymentsDisabled(req, res)) {
      return;
    }

    try {
      // Only signed events are processed: without the endpoint secret the
      // webhook cannot be verified, so it is refused
      const { endpointSecret } = config.stripe;
      if (!stripe || !endpointSecret) {
        req.log(
          'Stripe webhook refused: Stripe or STRIPE_ENDPOINT_SECRET is not configured',
        );
        res.sendStatus(503);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody ?? '',
          req.header('stripe-signature') ?? '',
          endpointSecret,
        );
      } catch (error) {
        req.log(
          'Webhook signature verification failed.',
          error instanceof Error ? error.message : error,
        );
        res.sendStatus(400);
        return;
      }

      switch (event.type) {
        case 'payment_intent.succeeded': {
          req.log('=== Stripe webhook', event.type);
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
          } else {
            await createUpdateGeneralPaymentStatus(dependencies)({
              paymentId,
              paymentIntentId,
            });
          }

          break;
        }
        // Invoice paid, attach invoice details to payment
        case 'invoice.paid': {
          req.log('============ Stripe webhook', event.type);

          // The payload shape follows the webhook endpoint's API version;
          // stripe v19's Invoice type no longer declares `payment_intent`
          const invoice = event.data.object as unknown as {
            id: string;
            payment_intent: string;
            hosted_invoice_url: string;
          };
          const intentId = invoice.payment_intent;
          const invoiceId = invoice.id;
          const hostedInvoiceUrl = invoice.hosted_invoice_url;

          const paymentIntent = await stripe.paymentIntents.retrieve(intentId);
          const product = paymentIntent.metadata.product;

          if (product === 'course') {
            await createUpdateCoursePaymentInvoiceId(dependencies)({
              intentId: intentId,
              invoiceUrl: hostedInvoiceUrl,
              stripeInvoiceId: invoiceId,
            });
          } else if (product === 'event') {
            await createUpdateEventPaymentInvoiceId(dependencies)({
              intentId: intentId,
              invoiceUrl: hostedInvoiceUrl,
              stripeInvoiceId: invoiceId,
            });
          } else {
            await createUpdateGeneralPaymentInvoiceId(dependencies)({
              intentId: intentId,
              invoiceUrl: hostedInvoiceUrl,
              stripeInvoiceId: invoiceId,
            });
          }

          break;
        }
        default: {
          req.log(`Unhandled event type ${event.type}.`);
        }
      }

      res.send();
    } catch (error) {
      req.log('Error in stripe webhook', error);
    }
  });

  return router;
};
