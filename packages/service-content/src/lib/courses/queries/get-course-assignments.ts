import { sql } from '@blms/database';
import type { CourseAssignment } from '@blms/types';

export const getCourseAssignmentsQuery = (courseId: string) => {
  return sql<CourseAssignment[]>`
    SELECT
      ca.*
    FROM content.course_assignment ca
    WHERE ca.course_id = ${courseId}
    ORDER BY ca.name ASC
  `;
};
