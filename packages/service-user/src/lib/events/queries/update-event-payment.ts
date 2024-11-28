import { sql } from '@blms/database';
import type { EventPayment } from '@blms/types';

type UpdateEventPayment = (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
) & {
  id: string;
  intentId?: string;
  stripeInvoiceId?: string;
};

export const updateEventPaymentQuery = ({
  id,
  isPaid,
  isExpired,
  intentId,
  stripeInvoiceId,
}: UpdateEventPayment) => {
  if (isExpired) {
    return sql<EventPayment[]>`
      UPDATE users.event_payment
      SET payment_status = 'expired'
      ${intentId ? sql`, stripe_payment_intent = ${intentId}` : sql``}
      ${stripeInvoiceId ? sql`, stripe_invoice_id = ${stripeInvoiceId}` : sql``}
      WHERE payment_id = ${id}
    ;
    `;
  }

  if (isPaid) {
    return sql<EventPayment[]>`
      UPDATE users.event_payment
        SET payment_status = 'paid'
        ${intentId ? sql`, stripe_payment_intent = ${intentId}` : sql``}
        ${stripeInvoiceId ? sql`, stripe_invoice_id = ${stripeInvoiceId}` : sql``}
        WHERE payment_id = ${id}
      ;
    `;
  }

  throw new Error('Should have isPaid or isExpired = true');
};

export const updateEventPaymentInvoiceId = ({
  intentId,
  stripeInvoiceId,
  invoiceUrl,
}: {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}) => {
  return sql<EventPayment[]>`
      UPDATE users.event_payment
        SET stripe_invoice_id = ${stripeInvoiceId}
          , invoice_url = ${invoiceUrl}
        WHERE stripe_payment_intent = ${intentId}
      ;
    `;

  throw new Error('Should have isPaid or isExpired = true');
};
