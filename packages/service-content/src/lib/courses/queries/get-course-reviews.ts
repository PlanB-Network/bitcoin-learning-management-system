import { sql } from '@blms/database';
import type { CourseReviewsExtended } from '@blms/types';

export const getCourseReviewsQuery = (courseId: string) => {
  return sql<CourseReviewsExtended[]>`
    SELECT
      json_agg(cr.general) AS general,
      json_agg(cr.difficulty) AS difficulty,
      json_agg(cr.length) AS length,
      json_agg(cr.faithful) AS faithful,
      json_agg(cr.recommand) AS recommand,
      json_agg(cr.quality) AS quality,
      json_agg(
        json_build_object(
          'date', cr.created_at,
          'user', u.display_name,
          'publicComment', cr.public_comment,
          'teacherComment', cr.teacher_comment,
          'adminComment', cr.admin_comment
        )
      ) AS feedbacks
    FROM users.course_review cr
    JOIN users.accounts u ON cr.uid = u.uid
    WHERE cr.course_id = ${courseId}
    GROUP BY cr.course_id;
  `;
};
