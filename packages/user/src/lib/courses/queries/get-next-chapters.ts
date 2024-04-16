import { sql } from '@sovereign-university/database';
import type { CourseUserChapter } from '@sovereign-university/types';

export const getNextChaptersQuery = (uid: string) => {
  return sql<Array<Pick<CourseUserChapter, 'courseId' | 'part' | 'chapter'>>>`
    WITH AllChapters AS (
      SELECT DISTINCT c.course_id, cp.part, cp.chapter
      FROM content.course_chapters cp
      JOIN users.course_user_chapter c ON cp.course_id = c.course_id
      WHERE c.uid = ${uid}
    ),
    CompletedChapters AS (
      SELECT course_id, part, chapter
      FROM users.course_user_chapter
      WHERE uid = ${uid} AND completed_at is not null
    ),
    NextChapters AS (
      SELECT
        ac.course_id,
        ac.part,
        ac.chapter,
        ROW_NUMBER() OVER (PARTITION BY ac.course_id ORDER BY ac.part ASC, ac.chapter ASC) AS rn
      FROM AllChapters ac
      LEFT JOIN CompletedChapters cc ON ac.course_id = cc.course_id AND ac.part = cc.part AND ac.chapter = cc.chapter
      WHERE cc.chapter IS NULL
    )
    SELECT course_id, part, chapter
    FROM NextChapters
    WHERE rn = 1;
  `;
};
