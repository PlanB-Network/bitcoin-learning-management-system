import { sql } from '@blms/database';
import type {
  CourseAssignment,
  MinimalCourseAssignmentWithStudents,
} from '@blms/types';

export const getCourseAssignmentsQuery = (courseId: string) => {
  return sql<CourseAssignment[]>`
    SELECT
      ca.*
    FROM content.course_assignment ca
    WHERE ca.course_id = ${courseId}
    ORDER BY ca.name ASC
  `;
};

export const getCourseAssignmentsWithStudentsGradesQuery = (
  courseId: string,
) => {
  return sql<MinimalCourseAssignmentWithStudents[]>`
    SELECT
      ca.id,
      ca.name,
      COALESCE(students_agg.students, '[]'::jsonb) as students
    FROM content.course_assignment AS ca
    LEFT JOIN (
      SELECT
        ucp.affected_assignment_id,
        jsonb_agg(
          jsonb_build_object(
            'uid', ua.uid,
            'username', ua.username,
            'displayName', ua.display_name,
            'grade', ucp.assignment_grade
          ) ORDER BY ucp.assignment_grade DESC
        ) AS students
      FROM users.course_progress AS ucp
      JOIN users.accounts AS ua ON ucp.uid = ua.uid
      WHERE ucp.affected_assignment_id IS NOT NULL
      GROUP BY ucp.affected_assignment_id
    ) AS students_agg ON ca.id = students_agg.affected_assignment_id
    WHERE ca.course_id = ${courseId}
    ORDER BY ca.name ASC;
  `;
};
