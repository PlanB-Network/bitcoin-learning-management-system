import { sql } from '@sovereign-university/database';
import { CoursePayment } from '@sovereign-university/types';

export const updatePayment = ({
  id,
  isPaid,
  isExpired,
}: {
  id: string;
  isPaid: boolean;
  isExpired: boolean;
}) => {
  if (isExpired) {
    return sql<CoursePayment[]>`
      UPDATE users.course_payment 
      SET payment_status = 'expired'
      WHERE id = ${id} 
    ;
    `;
  } else if (isPaid) {
    return sql<CoursePayment[]>`
      UPDATE users.course_payment 
      SET payment_status = 'paid'
      WHERE id = ${id} 
    ;
    `;
  } else {
    throw new Error('Should have isPaid or isExpired = true');
  }
};
