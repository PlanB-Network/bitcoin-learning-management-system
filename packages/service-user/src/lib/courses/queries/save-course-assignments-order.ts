import { sql } from '@blms/database';

export const saveCourseAssignmentsOrderQuery = (
  courseId: string,
  assignmentsIds: string[],
  uid: string,
) => {
  return sql`
    INSERT INTO users.course_progress (uid, course_id, applied_assignment_ids, last_updated)
    VALUES (${uid}, ${courseId}, ${assignmentsIds}, NOW())
    ON CONFLICT (uid, course_id) DO UPDATE SET
      applied_assignment_ids = EXCLUDED.applied_assignment_ids,
      last_updated = EXCLUDED.last_updated
    RETURNING *;
  `;
};
