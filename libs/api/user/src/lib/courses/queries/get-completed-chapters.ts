import { sql } from '@sovereign-university/database';
import type { CourseCompletedChapter } from '@sovereign-university/types';

type CompletedChapters = Pick<
  CourseCompletedChapter,
  'course_id' | 'chapter' | 'completed_at'
>[];

export const getCompletedChaptersQuery = (uid: string, courseId?: string) => {
  return sql<CompletedChapters>`
    SELECT
      course_id, chapter, completed_at
    FROM users.course_completed_chapters
    WHERE
      uid = ${uid}
      ${courseId ? sql`AND course_id = ${courseId}` : sql``};
  `;
};
