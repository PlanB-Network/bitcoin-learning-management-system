import { sql } from '@blms/database';

export const getCourseProfessorsQuery = (courseId: string) => {
  return sql`
    SELECT
      cp.professor_id as id,
      p.name,
      cp.is_coordinator as "isCoordinator"
    FROM content.course_professors cp
    JOIN content.professors p ON cp.professor_id = p.id
    WHERE cp.course_id = ${courseId}
    ORDER BY cp.is_coordinator DESC, p.name ASC
  `;
};
