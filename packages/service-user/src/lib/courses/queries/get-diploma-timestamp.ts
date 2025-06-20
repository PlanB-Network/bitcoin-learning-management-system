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

export const getUidCourseIdAndUsernameByExamTimestampIdQuery = (
  certificateId: string,
) => {
  return sql`
    SELECT et.uid, et.course_id, u.display_name
    FROM users.exam_timestamps et
    JOIN users.accounts u ON et.uid = u.uid
    WHERE et.id = ${certificateId}
    LIMIT 1;
  `;
};
