import { sql } from '@blms/database';

export const saveCourseAssignmentsOrderQuery = (
  courseId: string,
  assignmentsIds: string[],
  uid: string,
) => {
  return sql`
    UPDATE users.course_progress
    SET
      applied_assignment_ids = ${assignmentsIds},
      last_updated = NOW()
    WHERE uid = ${uid} AND course_id = ${courseId}
    RETURNING *;
  `;
};
