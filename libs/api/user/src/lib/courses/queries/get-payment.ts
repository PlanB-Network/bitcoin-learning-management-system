import { sql } from '@sovereign-university/database';
import { CoursePayment } from '@sovereign-university/types';

export const getPaymentQuery = (uid: string) => {
  return sql<
    Pick<
      CoursePayment,
      'course_id' | 'payment_status' | 'amount' | 'payment_id' | 'invoice_url'
    >[]
  >`
    SELECT cp.course_id, cp.payment_status, cp.amount, cp.payment_id, cp.invoice_url 
    FROM  users.course_payment cp 
    WHERE cp.uid = ${uid};
  `;
};
