import { sql } from '@blms/database';
import type { CourseMeta } from '@blms/types';

export const getCourseMetaQuery = (id: string, language?: string) => {
  return sql<CourseMeta[]>`
    SELECT
      c.id,
      c.index,
      cl.language,
      c.topic,
      c.subtopic,
      c.contact,
      c.last_commit,
      cl.name,
      cl.goal,
      cl.objectives
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id

    WHERE c.id = ${id}
    ${language ? sql`AND cl.language = LOWER(${language})` : sql``}
  `;
};
