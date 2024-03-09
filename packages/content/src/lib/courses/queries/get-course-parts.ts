import { sql } from '@sovereign-university/database';
import type { CoursePartLocalized } from '@sovereign-university/types';

export const getCoursePartsQuery = (id: string, language?: string) => {
  return sql<CoursePartLocalized[]>`
    SELECT part, language, title
    FROM content.course_parts_localized
    WHERE course_id = ${id} 
    ${language ? sql`AND language = ${language}` : sql``}
    ORDER BY part ASC
  `;
};
