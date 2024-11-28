import type { Dependencies } from '../../../dependencies.js';
import {
  updateEventPaymentInvoiceId,
  updateEventPaymentQuery,
} from '../queries/update-event-payment.js';

type Options = { id: string } & (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
);

export const createUpdateEventPayment = ({ postgres }: Dependencies) => {
  return async (options: Options) => {
    const query = updateEventPaymentQuery(options);
    await postgres.exec(query);
  };
};

interface Options2 {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}

export const createUpdateEventPaymentInvoiceId = ({
  postgres,
}: Dependencies) => {
  return async (options: Options2) => {
    await postgres.exec(updateEventPaymentInvoiceId(options));
  };
};
