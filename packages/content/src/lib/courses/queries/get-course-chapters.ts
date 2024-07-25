import { sql } from '@blms/database';
import type { JoinedCourseChapter } from '@blms/types';

export const getCourseChaptersQuery = ({
  courseId,
  partId,
  language,
}: {
  courseId: string;
  partId?: string;
  language?: string;
}) => {
  return sql<JoinedCourseChapter[]>`
    SELECT ch.part_id, c.chapter_id, part_index, chapter_index, c.language, c.title, c.sections, c.release_place, c.raw_content, c.is_online, c.is_in_person, 
      c.start_date, c.end_date, c.timezone, c.address_line_1, c.address_line_2, c.address_line_3, c.live_url, c.chat_url, c.available_seats, c.remaining_seats, c.live_language,
      cl.title as part_title
    FROM content.course_chapters_localized c
    LEFT JOIN content.course_chapters ch
      ON c.chapter_id = ch.chapter_id
    LEFT JOIN content.course_parts cp
      ON ch.part_id = cp.part_id
    LEFT JOIN content.course_parts_localized cl 
      ON c.course_id = cl.course_id AND c.language = cl.language  AND ch.part_id = cl.part_id
    WHERE c.course_id = ${courseId} 
      ${language ? sql`AND c.language = ${language}` : sql``}
      ${partId ? sql`AND ch.part_id = ${partId}` : sql``}
    ORDER BY part_index, chapter_index ASC
  `;
};
