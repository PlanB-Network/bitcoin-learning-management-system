import { sql } from '@sovereign-university/database';
import type { JoinedCourseChapter } from '@sovereign-university/types';

export const getCourseChaptersQuery = ({
  courseId,
  partIndex,
  language,
}: {
  courseId: string;
  partIndex?: number;
  language?: string;
}) => {
  return sql<JoinedCourseChapter[]>`
    SELECT c.part, c.chapter, c.language, c.title, c.sections, c.release_place, c.raw_content, c.is_online, c.is_in_person, 
    c.start_date, c.end_date, c.timezone, c.address_line_1, c.address_line_2, c.address_line_3, c.live_url, c.available_seats,
    cl.title as part_title
    FROM content.course_chapters_localized c
    LEFT JOIN content.course_parts_localized cl 
    ON c.course_id = cl.course_id AND c.part = cl.part AND c.language = cl.language
    WHERE c.course_id = ${courseId} 
    ${language ? sql`AND c.language = ${language}` : sql``}
    ${partIndex ? sql`AND c.part = ${partIndex}` : sql``}
    ORDER BY part, chapter ASC
  `;
};
