import { sql } from '@blms/database';
import type { EventPayment } from '@blms/types';

export const insertEventPayment = ({
  uid,
  eventId,
  paymentStatus,
  amount,
  paymentId,
  invoiceUrl,
  withPhysical,
}: {
  uid: string;
  eventId: string;
  paymentStatus: string;
  amount: number;
  paymentId: string;
  invoiceUrl: string;
  withPhysical: boolean;
}) => {
  return sql<EventPayment[]>`
  INSERT INTO users.event_payment (
    uid, event_id, payment_status, amount, payment_id, invoice_url, with_physical
  ) VALUES (
    ${uid}, ${eventId}, ${paymentStatus}, ${amount}, ${paymentId}, ${invoiceUrl}, ${withPhysical}
  )
  ON CONFLICT (uid, event_id, payment_id) DO UPDATE SET
    payment_status = EXCLUDED.payment_status,
    amount = EXCLUDED.amount,
    invoice_url = EXCLUDED.invoice_url
  RETURNING *;
  `;
};
