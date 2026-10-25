import { sql } from '@blms/database';
import type { CoursePayment } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

export const createGetPendingCoursePayments = ({ postgres }: Dependencies) => {
  type Result = Pick<CoursePayment, 'uid' | 'courseId' | 'paymentId'>;

  return (): Promise<Result[]> => {
    return postgres.exec(sql<Result[]>`
      SELECT
        uid,
        course_id,
        payment_id
      FROM
        users.course_payment
      WHERE
        payment_status = 'pending'
        AND method = 'sbp'
      ;
    `);
  };
};
