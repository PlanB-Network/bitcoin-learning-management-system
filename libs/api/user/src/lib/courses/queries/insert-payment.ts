import { sql } from '@sovereign-university/database';
import { CoursePayment } from '@sovereign-university/types';

export const insertPayment = ({
  uid,
  courseId,
  paymentStatus,
  amount,
  paymentId,
  invoiceUrl,
}: {
  uid: string;
  courseId: string;
  paymentStatus: string;
  amount: number;
  paymentId: string;
  invoiceUrl: string;
}) => {
  return sql<CoursePayment[]>`
    INSERT INTO users.course_payment (
      uid, course_id, payment_status, amount, payment_id, invoice_url
    ) VALUES (
      ${uid}, ${courseId}, ${paymentStatus}, ${amount}, ${paymentId}, ${invoiceUrl}
    )
    RETURNING *;
  `;
};
