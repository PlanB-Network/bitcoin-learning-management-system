import { sql } from '@blms/database';
import type { CourseActivity } from '@blms/types';

export const getRecentCourseActivityQuery = (courseId: string) => {
  return sql<CourseActivity[]>`
      WITH activity AS (
      -- Enrolled users
      SELECT
        ua.display_name,
        'enrolled' AS type,
        cp.start_date AS date,
        false AS "withComment",
        NULL AS score
      FROM users.course_progress cp
      JOIN users.accounts ua ON cp.uid = ua.uid
      WHERE cp.course_id = ${courseId}

      UNION ALL

      -- Graduated users (exam_attempts so only for courses with multi-attempt exams)
      SELECT
        ua.display_name,
        'graduated' AS type,
        ea.finished_at AS date,
        false AS "withComment",
        ea.score AS score
      FROM users.exam_attempts ea
      JOIN users.accounts ua ON ea.uid = ua.uid
      JOIN content.courses c ON ea.course_id = c.id
      WHERE ea.course_id = ${courseId}
        AND ea.succeeded = true

      UNION ALL

      -- Reviews
      SELECT
        ua.display_name,
        'review' AS type,
        cr.created_at AS date,
        CASE
          WHEN (cr.public_comment IS NOT NULL AND cr.public_comment != '')
            OR (cr.teacher_comment IS NOT NULL AND cr.teacher_comment != '')
          THEN true
          ELSE false
        END AS "withComment",
        NULL AS score
      FROM users.course_review cr
      JOIN users.accounts ua ON cr.uid = ua.uid
      WHERE cr.course_id = ${courseId}
    )
    SELECT *
    FROM activity
    WHERE date >= NOW() - INTERVAL '1 MONTHS'
    ORDER BY date DESC;
    `;
};
