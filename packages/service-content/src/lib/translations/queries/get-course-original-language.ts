import { sql } from '@blms/database';

export const getCourseOriginalLanguageQuery = (courseId: string) => {
  return sql<{ originalLanguage: string }[]>`
    SELECT original_language AS "originalLanguage"
    FROM content.courses
    WHERE id = ${courseId}
    LIMIT 1
  `;
};
