import { sql } from '@blms/database';
import type { CourseUserChapter } from '@blms/types';

type CompletedChapters = Array<
  Pick<CourseUserChapter, 'courseId' | 'chapterId' | 'completedAt'>
>;

export const getCompletedChaptersQuery = (uid: string, courseId?: string) => {
  return sql<CompletedChapters>`
    SELECT
      course_id, chapter_id, completed_at
    FROM users.course_user_chapter
    WHERE
      completed_at is not null AND
      uid = ${uid} 
      ${courseId ? sql`AND course_id = ${courseId}` : sql``};
  `;
};
