import { sql } from '@sovereign-university/database';
import type {
  Course,
  CourseChapterLocalized,
} from '@sovereign-university/types';

export const getCourseChapterQuery = (
  courseId: string,
  partIndex: number,
  chapterIndex: number,
  language?: string,
) => {
  return sql<
    Array<
      Pick<
        CourseChapterLocalized,
        'part' | 'chapter' | 'language' | 'title' | 'rawContent'
      > &
        Pick<Course, 'lastCommit' | 'lastUpdated'>
    >
  >`
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
