import { sql } from '@blms/database';

/**
 * Query to get all courses that have translations with 'todo' status
 */
export const getCoursesWithTodoTranslationsQuery = () => {
  return sql`
    WITH course_todo_languages AS (
      SELECT
        ct.course_id,
        ARRAY_AGG(ct.language ORDER BY ct.language) AS todo_languages
      FROM content.course_translations ct
      WHERE ct.status = 'todo'
      GROUP BY ct.course_id
    ),
    course_total_languages AS (
      SELECT
        ct.course_id,
        COUNT(*) AS total_languages
      FROM content.course_translations ct
      WHERE ct.status = 'todo'
      GROUP BY ct.course_id
    )
    SELECT
      c.id AS "courseId",
      c.index AS "courseIndex",
      cl.name AS "courseName",
      ctl.todo_languages AS "todoLanguages",
      cttl.total_languages AS "totalLanguages"
    FROM content.courses c
    JOIN content.courses_localized cl ON (c.id = cl.course_id AND cl.language = 'en')
    JOIN course_todo_languages ctl ON c.id = ctl.course_id
    LEFT JOIN course_total_languages cttl ON c.id = cttl.course_id
    WHERE c.is_archived = false
    AND ARRAY_LENGTH(ctl.todo_languages, 1) > 0
    ORDER BY cl.name
  `;
};
