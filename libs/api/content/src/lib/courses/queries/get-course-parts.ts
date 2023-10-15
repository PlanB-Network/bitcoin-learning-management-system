import { sql } from '@sovereign-university/database';
import { CoursePart } from '@sovereign-university/types';

export const getCoursePartsQuery = (id: string, language?: string) => {
  return sql<CoursePart[]>`
    SELECT part, language, title
    FROM content.course_parts_localized
    WHERE course_id = ${id} 
    ${language ? sql`AND language = ${language}` : sql``}
    ORDER BY part ASC
  `;
};
