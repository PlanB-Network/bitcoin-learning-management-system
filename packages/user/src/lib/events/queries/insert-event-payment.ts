import { sql } from '@sovereign-university/database';
import type { EventPayment } from '@sovereign-university/types';

export const insertEventPayment = ({
  uid,
  eventId,
  paymentStatus,
  amount,
  paymentId,
  invoiceUrl,
}: {
  uid: string;
  eventId: string;
  paymentStatus: string;
  amount: number;
  paymentId: string;
  invoiceUrl: string;
}) => {
  return sql<EventPayment[]>`
  INSERT INTO users.event_payment (
    uid, event_id, payment_status, amount, payment_id, invoice_url
  ) VALUES (
    ${uid}, ${eventId}, ${paymentStatus}, ${amount}, ${paymentId}, ${invoiceUrl}
  )
  ON CONFLICT (uid, event_id, payment_id) DO UPDATE SET
    payment_status = EXCLUDED.payment_status,
    amount = EXCLUDED.amount,
    invoice_url = EXCLUDED.invoice_url
  RETURNING *;
  `;
};
