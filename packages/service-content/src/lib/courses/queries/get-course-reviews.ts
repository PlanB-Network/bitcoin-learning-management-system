import { sql } from '@blms/database';
import type { CourseReviewsExtended } from '@blms/types';

export const getPublicCourseReviewsQuery = (courseId: string) => {
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
          'userPicture', u.picture,
          'publicComment', cr.public_comment,
          'teacherComment', NULL,
          'adminComment', NULL
        )
      ) AS feedbacks
    FROM users.course_review cr
    JOIN users.accounts u ON cr.uid = u.uid
    WHERE cr.course_id = ${courseId}
    GROUP BY cr.course_id;
  `;
};

export const getTeacherCourseReviewsQuery = (courseId: string) => {
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
          'userPicture', u.picture,
          'publicComment', cr.public_comment,
          'teacherComment', cr.teacher_comment,
          'adminComment', NULL
        )
      ) AS feedbacks
    FROM users.course_review cr
    JOIN users.accounts u ON cr.uid = u.uid
    WHERE cr.course_id = ${courseId}
    GROUP BY cr.course_id;
  `;
};
