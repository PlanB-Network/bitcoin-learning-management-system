import { sql } from '@blms/database';
import type { CourseReview } from '@blms/types';

export const getCourseReview = (uid: string, courseId: string) => {
  return sql<CourseReview[]>`
    SELECT
      *
    FROM users.course_review
    WHERE
      uid = ${uid} 
      AND course_id = ${courseId};
  `;
};
