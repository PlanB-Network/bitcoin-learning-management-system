import { sql } from '@blms/database';
import type { CourseProgress } from '@blms/types';

export const getProgressQuery = (uid: string, courseId?: string) => {
  return sql<
    Array<
      CourseProgress & {
        totalChapters: number;
        courseIndex: string;
      }
    >
  >`
    SELECT
      cp.*,
      c.index as course_index,
      (
        SELECT COUNT(*)
        FROM content.course_chapters cc
        WHERE cc.course_id = cp.course_id
      ) as total_chapters
    FROM users.course_progress cp
    JOIN content.courses c ON c.id = cp.course_id
    WHERE cp.uid = ${uid}
    ${courseId ? sql`AND cp.course_id = ${courseId}` : sql``};
  `;
};
