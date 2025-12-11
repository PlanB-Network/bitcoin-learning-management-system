import { sql } from '@blms/database';

import type { CourseHighlight } from './get-highlights.js';

export const insertHighlight = ({
  uid,
  chapterId,
  text,
  startOffset,
  endOffset,
  startContainerPath,
  endContainerPath,
}: {
  uid: string;
  chapterId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  startContainerPath: string;
  endContainerPath: string;
}) => {
  return sql<CourseHighlight[]>`
    INSERT INTO users.course_highlights (
      uid, chapter_id, text, start_offset, end_offset, start_container_path, end_container_path
    ) VALUES (
      ${uid}, ${chapterId}, ${text}, ${startOffset}, ${endOffset}, ${startContainerPath}, ${endContainerPath}
    )
    RETURNING
      id,
      uid,
      chapter_id as "chapterId",
      text,
      start_offset as "startOffset",
      end_offset as "endOffset",
      start_container_path as "startContainerPath",
      end_container_path as "endContainerPath",
      created_at as "createdAt";
  `;
};
