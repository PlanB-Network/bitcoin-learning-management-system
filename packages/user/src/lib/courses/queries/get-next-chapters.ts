import { sql } from '@sovereign-university/database';
import { CourseChapter } from '@sovereign-university/types';

export const getNextChaptersQuery = (uid: string) => {
  return sql<Pick<CourseChapter, 'course_id' | 'part' | 'chapter'>[]>`
    WITH AllChapters AS (
      SELECT DISTINCT c.course_id, cp.part, cp.chapter
      FROM content.course_chapters cp
      JOIN users.course_completed_chapters c ON cp.course_id = c.course_id
      WHERE c.uid = ${uid}
    ),
    CompletedChapters AS (
      SELECT course_id, part, chapter
      FROM users.course_completed_chapters
      WHERE uid = ${uid}
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
