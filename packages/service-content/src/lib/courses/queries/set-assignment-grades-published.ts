import { sql } from '@blms/database';

export const setCourseAssignmentGradesAsPublishedQuery = (courseId: string) => {
  return sql`
    UPDATE content.courses
    SET
      is_assignment_grading_published = true
    WHERE id = ${courseId}
    RETURNING *;
  `;
};
