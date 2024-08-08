import { sql } from '@blms/database';
import type { CoursePayment } from '@blms/types';

export type GetPaymentQueryOutput = Array<
  Pick<
    CoursePayment,
    'courseId' | 'paymentStatus' | 'amount' | 'paymentId' | 'invoiceUrl'
  >
>;

export const getPaymentQuery = (uid: string) => {
  return sql<GetPaymentQueryOutput>`
    SELECT cp.course_id, cp.payment_status, cp.amount, cp.payment_id, cp.invoice_url 
    FROM  users.course_payment cp 
    WHERE cp.uid = ${uid};
  `;
};
