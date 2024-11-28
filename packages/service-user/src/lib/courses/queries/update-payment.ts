import { sql } from '@blms/database';
import type { CoursePayment } from '@blms/types';

export const updateCoursePaymentQuery = ({
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
    return sql<CoursePayment[]>`
      UPDATE users.course_payment
      SET payment_status = 'expired'
      ${intentId ? sql`, stripe_payment_intent = ${intentId}` : sql``}
      ${stripeInvoiceId ? sql`, stripe_invoice_id = ${stripeInvoiceId}` : sql``}
      WHERE payment_id = ${id}
    ;
    `;
  }

  if (isPaid) {
    return sql<CoursePayment[]>`
      UPDATE users.course_payment
        SET payment_status = 'paid'
        ${intentId ? sql`, stripe_payment_intent = ${intentId}` : sql``}
        ${stripeInvoiceId ? sql`, stripe_invoice_id = ${stripeInvoiceId}` : sql``}
        WHERE payment_id = ${id}
      ;
    `;
  }

  throw new Error('Should have isPaid or isExpired = true');
};

export const updatePaymentInvoiceId = ({
  intentId,
  stripeInvoiceId,
  invoiceUrl,
}: {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}) => {
  return sql<CoursePayment[]>`
      UPDATE users.course_payment
        SET stripe_invoice_id = ${stripeInvoiceId}
          , invoice_url = ${invoiceUrl}
        WHERE stripe_payment_intent = ${intentId}
      ;
    `;
};
