import { sql } from '@blms/database';

export const getCourseCoordinatorsQuery = (courseId: string) => {
  return sql`
    SELECT
      professor_id
    FROM content.course_professors cp
    WHERE cp.course_id = ${courseId}
      AND cp.is_coordinator = true
  `;
};
