import { sql } from '@blms/database';

export const saveCourseAssignmentSubmissionTimeQuery = (
  courseId: string,
  uid: string,
) => {
  return sql`
    UPDATE users.course_progress
    SET
      assignment_submission_time = NOW(),
      last_updated = NOW()
    WHERE uid = ${uid} AND course_id = ${courseId}
    RETURNING *;
  `;
};
