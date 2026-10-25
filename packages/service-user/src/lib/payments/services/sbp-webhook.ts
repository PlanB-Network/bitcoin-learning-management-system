import { createHmac, timingSafeEqual } from 'node:crypto';

import { firstRow } from '@blms/database';
import type { SwissBitcoinPayCheckout } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { createUpdateCoursePayment } from '../../courses/services/save-course-payment.js';
import { createUpdateEventPayment } from '../../events/services/update-event-payment.js';
import {
  getSbpPaymentQuery,
  type SbpPayment,
} from '../queries/get-sbp-payment.js';
import {
  createGetSbpCheckout,
  type SbpPaymentType,
} from './payment-service.js';
import { createUpdateGeneralPayment } from './save-general-payment.js';

/**
 * Check the `sbp-sig` header SwissBitcoinPay adds to webhook calls when a
 * Secret key (HMAC) is configured on the merchant account:
 * `sha256=<hex HMAC-SHA256 of the raw request body>`.
 *
 * Reference: SwissBitcoinPay's own plugins, e.g.
 * https://github.com/SwissBitcoinPay/wix-plugin/blob/1f0c635c6360ea58bde5d26575e3f3227a02a481/http-function.js
 */
export const isValidSbpSignature = (
  rawBody: Buffer | undefined,
  signature: string | undefined,
  secret: string,
) => {
  if (!rawBody || !signature) {
    return false;
  }

  const expected = Buffer.from(
    `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`,
  );
  const received = Buffer.from(signature);

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
};

export type SbpWebhookResult =
  | { outcome: 'paid' }
  | { outcome: 'expired' }
  | { outcome: 'ignored'; reason: string };

export interface SbpWebhookStore {
  getCheckout: (id: string) => Promise<SwissBitcoinPayCheckout | null>;
  getPayment: (id: string) => Promise<SbpPayment | null>;
  /** Resolves to true when this call moved the payment to `paid` */
  markPaid: (id: string) => Promise<boolean>;
  /** Resolves to true when this call moved the payment to `expired` */
  markExpired: (id: string) => Promise<boolean>;
}

/**
 * Apply a SwissBitcoinPay webhook for the checkout `id`.
 *
 * The webhook body is untrusted: only the id is taken from it. The status and
 * amount come from SwissBitcoinPay's API, and the payment is marked paid only
 * when SwissBitcoinPay reports the checkout settled for the amount we stored
 * when we created it. Repeated calls are no-ops.
 */
export const processSbpWebhook = async (
  id: string,
  store: SbpWebhookStore,
): Promise<SbpWebhookResult> => {
  const checkout = await store.getCheckout(id);
  if (!checkout || checkout.id !== id) {
    return { outcome: 'ignored', reason: 'unknown checkout' };
  }

  const payment = await store.getPayment(id);
  if (!payment) {
    return { outcome: 'ignored', reason: 'unknown payment' };
  }

  if (checkout.status === 'settled') {
    if (payment.paymentStatus === 'paid') {
      return { outcome: 'ignored', reason: 'already paid' };
    }

    if (checkout.amount !== payment.amount) {
      return {
        outcome: 'ignored',
        reason: `amount mismatch: checkout ${checkout.amount} sats, payment ${payment.amount} sats`,
      };
    }

    return (await store.markPaid(id))
      ? { outcome: 'paid' }
      : { outcome: 'ignored', reason: 'already paid' };
  }

  if (checkout.status === 'expired') {
    return (await store.markExpired(id))
      ? { outcome: 'expired' }
      : { outcome: 'ignored', reason: 'payment not pending' };
  }

  return { outcome: 'ignored', reason: `checkout ${checkout.status}` };
};

export const createHandleSbpWebhook = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  const { postgres } = dependencies;
  const getCheckout = createGetSbpCheckout(dependencies);
  const updatePayment = {
    courses: createUpdateCoursePayment(dependencies),
    events: createUpdateEventPayment(dependencies),
    general: createUpdateGeneralPayment(dependencies),
  };

  return (type: SbpPaymentType, id: string) =>
    processSbpWebhook(id, {
      getCheckout,
      getPayment: (paymentId) =>
        postgres.exec(getSbpPaymentQuery(type, paymentId)).then(firstRow),
      markPaid: async (paymentId) =>
        (await updatePayment[type]({
          id: paymentId,
          isExpired: false,
          isPaid: true,
        })) !== null,
      markExpired: async (paymentId) =>
        (await updatePayment[type]({
          id: paymentId,
          isExpired: true,
          isPaid: false,
        })) !== null,
    });
};
