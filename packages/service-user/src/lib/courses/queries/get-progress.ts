import { sql } from '@blms/database';
import type { CourseProgress } from '@blms/types';

export const getProgressQuery = (uid: string) => {
  return sql<
    Array<
      CourseProgress & {
        totalChapters: number;
      }
    >
  >`
    SELECT 
      cp.*,
      (
        SELECT COUNT(*) 
        FROM content.course_chapters cc
        WHERE cc.course_id = cp.course_id
      ) as total_chapters
    FROM users.course_progress cp
    WHERE uid = ${uid};
  `;
};
