import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import type { Course } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';

interface CourseAccessResponse
  extends Pick<Course, 'id' | 'paidStartDate' | 'paidEndDate'> {
  uid: string | null;
  allowed: string;
}

export const createCheckCourseAccess = ({ postgres }: Dependencies) => {
  return (
    courseId: string,
    uid: string | null,
  ): Promise<CourseAccessResponse> => {
    return postgres
      .exec(
        sql<CourseAccessResponse[]>`
        SELECT
            c.id,
            c.paid_start_date,
            c.paid_end_date,
            cp.uid,
            CASE
                WHEN c.requires_payment = false THEN true
                WHEN cp.uid IS NOT NULL AND cp.payment_status = 'paid' THEN true
                ELSE false
            END AS allowed
        FROM
            content.courses c
        LEFT JOIN
            users.course_payment cp ON c.id = cp.course_id AND cp.uid = ${uid}
        WHERE
            c.id = ${courseId};
      `,
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
