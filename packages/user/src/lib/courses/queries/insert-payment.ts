import { sql } from '@sovereign-university/database';
import type { CoursePayment } from '@sovereign-university/types';

export const insertPayment = ({
  uid,
  courseId,
  paymentStatus,
  amount,
  paymentId,
  invoiceUrl,
  couponCode,
}: {
  uid: string;
  courseId: string;
  paymentStatus: string;
  amount: number;
  paymentId: string;
  invoiceUrl: string;
  couponCode?: string;
}) => {
  return sql<CoursePayment[]>`
  INSERT INTO users.course_payment (
    uid, course_id, payment_status, amount, payment_id, invoice_url, coupon_code
  ) VALUES (
    ${uid}, ${courseId}, ${paymentStatus}, ${amount}, ${paymentId}, ${invoiceUrl}, ${couponCode ? couponCode : null}
  )
  ON CONFLICT (uid, course_id, payment_id) DO UPDATE SET
    payment_status = EXCLUDED.payment_status,
    amount = EXCLUDED.amount,
    invoice_url = EXCLUDED.invoice_url,
    coupon_code = EXCLUDED.coupon_code
  RETURNING *;
  `;
};
