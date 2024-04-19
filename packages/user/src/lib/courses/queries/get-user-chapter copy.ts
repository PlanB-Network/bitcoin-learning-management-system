import { sql } from '@sovereign-university/database';
import type { CourseUserChapter } from '@sovereign-university/types';

type UserChapter = Array<
  Pick<
    CourseUserChapter,
    'courseId' | 'part' | 'chapter' | 'completedAt' | 'booked'
  >
>;

export const getUserChapterQuery = (uid: string, courseId: string) => {
  return sql<UserChapter>`
    SELECT course_id, part, chapter, completed_at, booked 
    FROM users.course_user_chapter
    WHERE uid = ${uid} AND course_id = ${courseId};
  `;
};
