import { sql } from '@blms/database';

export const getEnrolledStudentsCount = (courseId: string) => {
  return sql<{ enrolledStudentsCount: number }[]>`
      SELECT COUNT(*) as enrolled_students_count
      FROM users.course_progress cp
      WHERE cp.course_id = ${courseId};
    `;
};
