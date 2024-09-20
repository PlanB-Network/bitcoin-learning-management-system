import { sql } from '@blms/database';
import type { MinimalJoinedCourse } from '@blms/types';

type CourseMeta = Pick<
  MinimalJoinedCourse,
  | 'id'
  | 'language'
  | 'topic'
  | 'subtopic'
  | 'contact'
  | 'name'
  | 'goal'
  | 'objectives'
  | 'lastCommit'
>;

export const getCourseMetaQuery = (id: string, language?: string) => {
  return sql<CourseMeta[]>`
    SELECT 
      c.id, 
      cl.language, 
      c.topic,
      c.subtopic,
      c.contact,
      cl.name, 
      cl.goal,
      cl.objectives, 
      c.last_commit
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id

    WHERE c.id = ${id} 
    ${language ? sql`AND cl.language = ${language}` : sql``}
  `;
};
