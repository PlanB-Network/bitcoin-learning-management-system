import { sql } from '@blms/database';
import type { UserExamTimestamp } from '@blms/types';

export const getTeacherLedCourseDiplomaTimestampQuery = (
  uid: string,
  courseId: string,
) => {
  return sql<UserExamTimestamp[]>`
            SELECT * FROM users.exam_timestamps
            WHERE uid = ${uid}
              AND course_id = ${courseId}
              AND confirmed = true
              AND exam_attempt_id IS NULL
              ;
          `;
};
