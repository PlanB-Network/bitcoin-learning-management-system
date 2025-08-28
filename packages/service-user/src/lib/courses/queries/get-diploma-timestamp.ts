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
  isCourseWithSingleTrialExam: boolean,
) => {
  if (isCourseWithSingleTrialExam) {
    return sql`
      SELECT et.uid, et.course_id, u.display_name, et.img_key
      FROM users.exam_timestamps et
      JOIN users.accounts u ON et.uid = u.uid
      WHERE et.id = ${certificateId}
      LIMIT 1;
    `;
  }

  return sql`
    SELECT ea.uid, ea.course_id, u.display_name, et.img_key
    FROM users.exam_attempts ea
    JOIN users.accounts u ON ea.uid = u.uid
    JOIN users.exam_timestamps et ON ea.id = et.exam_attempt_id
    WHERE ea.id = ${certificateId}
    LIMIT 1;
  `;
};
