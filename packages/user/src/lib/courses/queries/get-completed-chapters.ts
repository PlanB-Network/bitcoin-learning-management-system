import { sql } from '@sovereign-university/database';
import type { CourseCompletedChapters } from '@sovereign-university/types';

type CompletedChapters = Array<
  Pick<CourseCompletedChapters, 'courseId' | 'part' | 'chapter' | 'completedAt'>
>;

export const getCompletedChaptersQuery = (uid: string, courseId?: string) => {
  return sql<CompletedChapters>`
    SELECT
      course_id, part, chapter, completed_at
    FROM users.course_completed_chapters
    WHERE
      uid = ${uid}
      ${courseId ? sql`AND course_id = ${courseId}` : sql``};
  `;
};
