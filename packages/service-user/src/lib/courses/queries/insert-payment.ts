import { sql } from '@blms/database';
import type { CoursePayment } from '@blms/types';

export const insertPayment = ({
  uid,
  courseId,
  paymentStatus,
  format,
  amount,
  paymentId,
  invoiceUrl,
  couponCode,
}: {
  uid: string;
  courseId: string;
  paymentStatus: string;
  format: string;
  amount: number;
  paymentId: string;
  invoiceUrl: string;
  couponCode?: string;
}) => {
  return sql<CoursePayment[]>`
  INSERT INTO users.course_payment (
    uid, course_id, payment_status, format, amount, payment_id, invoice_url, coupon_code
  ) VALUES (
    ${uid}, ${courseId}, ${paymentStatus}, ${format}, ${amount}, ${paymentId}, ${invoiceUrl}, ${couponCode ? couponCode : null}
  )
  ON CONFLICT (uid, course_id, payment_id) DO UPDATE SET
    payment_status = EXCLUDED.payment_status,
    format = EXCLUDED.format,
    amount = EXCLUDED.amount,
    invoice_url = EXCLUDED.invoice_url,
    coupon_code = EXCLUDED.coupon_code
  RETURNING *;
  `;
};
