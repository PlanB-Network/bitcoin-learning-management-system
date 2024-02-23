import { sql } from '@sovereign-university/database';
import type { JoinedCourseChapterWithContent } from '@sovereign-university/types';

export const getCourseChapterQuery = (
  courseId: string,
  partIndex: number,
  chapterIndex: number,
  language?: string,
) => {
  return sql<JoinedCourseChapterWithContent[]>`
    SELECT part, chapter, language, title, raw_content, c.last_updated, c.last_commit
    FROM content.course_chapters_localized
    JOIN content.courses c ON c.id = course_id
    WHERE
      course_id = ${courseId} 
      AND part = ${partIndex}
      AND chapter = ${chapterIndex}
    ${language ? sql`AND language = ${language}` : sql``}
  `;
};
