import { sql } from '@blms/database';

export const saveCourseAssignmentSubmissionTimeQuery = (
  courseId: string,
  uid: string,
) => {
  return sql`
    INSERT INTO users.course_progress (uid, course_id, assignment_submission_time, last_updated)
    VALUES (${uid}, ${courseId}, NOW(), NOW())
    ON CONFLICT (uid, course_id) DO UPDATE SET
      assignment_submission_time = EXCLUDED.assignment_submission_time,
      last_updated = EXCLUDED.last_updated
    RETURNING *;
  `;
};
