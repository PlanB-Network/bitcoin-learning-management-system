import { sql } from '@blms/database';

export const getPartAndChapterIdsQuery = (
  courseId: string,
  partIndex: number,
  chapterIndex: number,
) => {
  return sql<{ partId: string; chapterId: string }[]>`
    SELECT cp.part_id AS "partId", cc.chapter_id AS "chapterId"
    FROM content.course_parts cp
    JOIN content.course_chapters cc ON cp.part_id = cc.part_id
    WHERE cp.course_id = ${courseId}
      AND cp.part_index = ${partIndex}
      AND cc.chapter_index = ${chapterIndex}
    LIMIT 1
  `;
};
