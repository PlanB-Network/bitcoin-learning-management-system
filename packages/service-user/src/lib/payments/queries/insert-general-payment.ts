import { sql } from '@blms/database';
import type { CoursePayment } from '@blms/types';

export const insertGeneralPayment = ({
  uid,
  item,
  paymentStatus,
  amount,
  paymentId,
  invoiceUrl,
  method,
  couponCode,
}: {
  uid: string;
  item: string;
  paymentStatus: string;
  amount: number;
  paymentId: string;
  invoiceUrl: string;
  method: string;
  couponCode?: string;
}) => {
  return sql<CoursePayment[]>`
  INSERT INTO users.general_payment (
    uid, item, payment_status, amount, payment_id, invoice_url, method, coupon_code
  ) VALUES (
    ${uid}, ${item}, ${paymentStatus}, ${amount}, ${paymentId}, ${invoiceUrl}, ${method}, ${couponCode ? couponCode : null}
  )
  ON CONFLICT (uid, item, payment_id) DO UPDATE SET
    payment_status = EXCLUDED.payment_status,
    amount = EXCLUDED.amount,
    invoice_url = EXCLUDED.invoice_url,
    method = EXCLUDED.method,
    coupon_code = EXCLUDED.coupon_code
  RETURNING *;
  `;
};
