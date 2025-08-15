import { sql } from '@blms/database';
import type { GetUserChapterResponse } from '@blms/types';

export const getUserChapterQuery = (uid: string, courseId: string) => {
  return sql<GetUserChapterResponse[]>`
    SELECT course_id, chapter_id, completed_at, booked
    FROM users.course_user_chapter
    WHERE uid = ${uid} AND course_id = ${courseId};
  `;
};

export const getUserChapterAttendanceQuery = (chapterId: string) => {
  return sql<{ displayName: string }[]>`
    SELECT
      ua.display_name
    FROM users.course_user_chapter uc
    JOIN users.accounts ua ON uc.uid = ua.uid
    WHERE uc.chapter_id = ${chapterId} AND uc.booked = true;
  `;
};
