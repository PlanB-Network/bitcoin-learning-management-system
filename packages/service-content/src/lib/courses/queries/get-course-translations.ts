import { sql } from '@blms/database';

export interface CourseTranslationResponse {
  courseId: string;
  language: string;
}

export const getCourseTranslationsQuery = (language?: string) => {
  return sql<CourseTranslationResponse[]>`
    SELECT
      cl.course_id as "courseId",
      cl.language
    FROM content.courses_localized cl
    JOIN content.courses c ON c.id = cl.course_id
    WHERE c.is_archived = false
    ${language ? sql`AND cl.language = LOWER(${language})` : sql``}
    ORDER BY cl.course_id, cl.language
  `;
};
