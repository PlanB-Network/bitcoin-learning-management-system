import { sql } from '@blms/database';

export interface BasicCourse {
  id: string;
  index: string;
  topic: string;
  originalLanguage: string;
  isArchived: boolean;
  publishedAt: Date | null;
  lastCommit: string;
  name: string;
  goal: string;
}

export const getCoursesBasicQuery = (language = 'en') => {
  return sql<BasicCourse[]>`
    SELECT DISTINCT ON (c.id)
      c.id,
      c.index,
      c.topic,
      c.original_language as "originalLanguage",
      c.is_archived as "isArchived",
      c.published_at as "publishedAt",
      c.last_commit as "lastCommit",
      COALESCE(cl.name, c.index) as name,
      COALESCE(cl.goal, '') as goal
    FROM content.courses c
    LEFT JOIN content.courses_localized cl ON c.id = cl.course_id
      AND (cl.language = LOWER(${language}) OR cl.language = c.original_language)
    ORDER BY
      c.id,
      CASE
        WHEN cl.language = LOWER(${language}) THEN 1
        WHEN cl.language = c.original_language THEN 2
        ELSE 3
      END
  `;
};
