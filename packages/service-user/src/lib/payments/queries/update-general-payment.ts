import { sql } from '@blms/database';
import type { GeneralPayment } from '@blms/types';

export const updateGeneralPaymentQuery = ({
  id,
  isPaid,
  isExpired,
  intentId,
  stripeInvoiceId,
}: {
  id: string;
  isPaid: boolean;
  isExpired: boolean;
  intentId?: string;
  stripeInvoiceId?: string;
}) => {
  if (isExpired) {
    return sql<GeneralPayment[]>`
      UPDATE users.general_payment
      SET payment_status = 'expired'
      ${intentId ? sql`, stripe_payment_intent = ${intentId}` : sql``}
      ${stripeInvoiceId ? sql`, stripe_invoice_id = ${stripeInvoiceId}` : sql``}
      WHERE payment_id = ${id}
      RETURNING *
    ;
    `;
  }

  if (isPaid) {
    return sql<GeneralPayment[]>`
      UPDATE users.general_payment
        SET payment_status = 'paid'
        ${intentId ? sql`, stripe_payment_intent = ${intentId}` : sql``}
        ${stripeInvoiceId ? sql`, stripe_invoice_id = ${stripeInvoiceId}` : sql``}
        WHERE payment_id = ${id}
        RETURNING *
      ;
    `;
  }

  throw new Error('Should have isPaid or isExpired = true');
};

export const updateGeneralPaymentInvoiceId = ({
  intentId,
  stripeInvoiceId,
  invoiceUrl,
}: {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}) => {
  return sql<GeneralPayment[]>`
      UPDATE users.general_payment
        SET stripe_invoice_id = ${stripeInvoiceId}
          , invoice_url = ${invoiceUrl}
        WHERE stripe_payment_intent = ${intentId}
        RETURNING *
      ;
    `;
};
