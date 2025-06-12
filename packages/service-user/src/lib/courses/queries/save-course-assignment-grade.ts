import { sql } from '@blms/database';

export const saveCourseAssignmentGradeQuery = (
  courseId: string,
  uid: string,
  grade: number | null,
) => {
  return sql`
    UPDATE users.course_progress
    SET
      assignment_grade = ${grade},
      last_updated = NOW()
    WHERE uid = ${uid} AND course_id = ${courseId}
    RETURNING *;
  `;
};
