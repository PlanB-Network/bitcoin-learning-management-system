import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import {
  updateEventPaymentInvoiceId,
  updateEventPaymentQuery,
} from '../queries/update-event-payment.js';
import { createSendEventBookingEmail } from './send-booking-email.js';

type Options = { id: string } & (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
);

export const createUpdateEventPayment = ({
  postgres,
  config,
}: Pick<Dependencies, 'postgres' | 'config'>) => {
  return async (options: Options) => {
    const query = updateEventPaymentQuery(options);
    const paymentDetails = await postgres.exec(query).then(firstRow);

    if (options.isPaid && paymentDetails) {
      await createSendEventBookingEmail({ postgres, config })({
        eventId: paymentDetails.eventId,
        userId: paymentDetails.uid,
      });
    }
  };
};

interface Options2 {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}

export const createUpdateEventPaymentInvoiceId = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (options: Options2) => {
    await postgres.exec(updateEventPaymentInvoiceId(options));
  };
};
