import { sql } from '@sovereign-university/database';
import { JoinedCourse } from '@sovereign-university/types';

export const getCourseQuery = (id: string, language?: string) => {
  return sql<JoinedCourse[]>`
    SELECT 
      c.id, cl.language, c.level, c.hours, c.teacher, cl.name, cl.goal,
      cl.objectives, cl.raw_description, c.last_updated, c.last_commit
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id
    WHERE course_id = ${id} 
    ${language ? sql`AND cl.language = ${language}` : sql``}
  `;
};
