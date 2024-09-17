import { sql } from '@blms/database';
import type { JoinedCoursePartLocalized } from '@blms/types';

export const getCoursePartsQuery = (id: string, language?: string) => {
  return sql<JoinedCoursePartLocalized[]>`
    SELECT
      cpl.course_id,
      cpl.language,
      cpl.part_id,
      cpl.title,
      cp.part_index
    FROM content.course_parts_localized cpl
    LEFT JOIN content.course_parts cp
    on cp.part_id = cpl.part_id
    WHERE cpl.course_id = ${id} 
    ${language ? sql`AND cpl.language = ${language}` : sql``}
    ORDER BY cp.part_index ASC
  `;
};
