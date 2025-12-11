import { sql } from '@blms/database';

export interface CourseHighlight {
  id: string;
  uid: string;
  chapterId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  startContainerPath: string;
  endContainerPath: string;
  createdAt: Date;
}

export const getHighlightsByChapter = ({
  uid,
  chapterId,
}: {
  uid: string;
  chapterId: string;
}) => {
  return sql<CourseHighlight[]>`
    SELECT
      id,
      uid,
      chapter_id as "chapterId",
      text,
      start_offset as "startOffset",
      end_offset as "endOffset",
      start_container_path as "startContainerPath",
      end_container_path as "endContainerPath",
      created_at as "createdAt"
    FROM users.course_highlights
    WHERE uid = ${uid} AND chapter_id = ${chapterId}
    ORDER BY created_at ASC;
  `;
};
