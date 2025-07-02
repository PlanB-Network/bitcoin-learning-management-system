import { sql } from '@blms/database';
import type { Dependencies } from '../../dependencies.js';

export interface CourseWithTodoTranslations {
  id: string;
  index: string;
  courseName: string;
  todoLanguages: string[];
  totalLanguages: number;
}

/**
 * Service to get all courses that have translations with 'todo' status
 */
export const createGetCoursesWithTodoTranslations = ({
  postgres,
}: Dependencies) => {
  return async (): Promise<CourseWithTodoTranslations[]> => {
    const results = await postgres.exec(sql`
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
    `);

    return results.map((row) => ({
      id: row.courseId,
      index: row.courseIndex,
      courseName: row.courseName,
      todoLanguages: row.todoLanguages || [],
      totalLanguages: row.totalLanguages || 0,
    }));
  };
};
