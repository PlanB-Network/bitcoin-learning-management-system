import { sql } from '@blms/database';
import type { GetUserChapterResponse } from '@blms/types';

export const getUserChapterQuery = (uid: string, courseId: string) => {
  return sql<GetUserChapterResponse[]>`
    SELECT course_id, chapter_id, completed_at, booked 
    FROM users.course_user_chapter
    WHERE uid = ${uid} AND course_id = ${courseId};
  `;
};
