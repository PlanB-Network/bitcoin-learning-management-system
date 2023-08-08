import { sql } from '@sovereign-university/database';
import { CourseChapter } from '@sovereign-university/types';

export const getCourseChaptersQuery = (id: string, language?: string) => {
  return sql<CourseChapter[]>`
    SELECT chapter, language, title, sections
    FROM content.course_chapters_localized
    WHERE course_id = ${id} 
    ${language ? sql`AND language = ${language}` : sql``}
    ORDER BY chapter ASC
  `;
};
