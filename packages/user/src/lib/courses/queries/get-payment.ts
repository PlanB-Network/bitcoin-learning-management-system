import { sql } from '@sovereign-university/database';
import type { CoursePayment } from '@sovereign-university/types';

export const getPaymentQuery = (uid: string) => {
  return sql<
    Array<
      Pick<
        CoursePayment,
        'courseId' | 'paymentStatus' | 'amount' | 'paymentId' | 'invoiceUrl'
      >
    >
  >`
    SELECT cp.course_id, cp.payment_status, cp.amount, cp.payment_id, cp.invoice_url 
    FROM  users.course_payment cp 
    WHERE cp.uid = ${uid};
  `;
};
