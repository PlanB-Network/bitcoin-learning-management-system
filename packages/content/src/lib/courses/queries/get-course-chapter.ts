import { sql } from '@sovereign-university/database';
import type { JoinedCourseChapterWithContent } from '@sovereign-university/types';

export const getCourseChapterQuery = (chapterId: string, language?: string) => {
  return sql<JoinedCourseChapterWithContent[]>`
    SELECT cl.course_id, ch.part_id, cl.chapter_id, part_index, chapter_index, language, title, sections, release_place, raw_content, is_online, is_in_person, 
    start_date, end_date, timezone, address_line_1, address_line_2, address_line_3, live_url, chat_url, available_seats, remaining_seats, live_language,
    c.last_updated, c.last_commit, COALESCE(cp_agg.professors, ARRAY[]::varchar[20]) AS professors
    FROM content.course_chapters_localized cl
    JOIN content.courses c ON c.id = cl.course_id
    LEFT JOIN content.course_chapters ch
      ON cl.chapter_id = ch.chapter_id
    LEFT JOIN content.course_parts cpa
      ON ch.part_id = cpa.part_id
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(cp.contributor_id) AS professors
      FROM content.course_chapters_localized_professors cp
      WHERE 
        cl.chapter_id = ${chapterId}
        AND cl.language = ${language ? language : 'language'} -- Fallback to the chapter's language if none provided
    ) AS cp_agg ON TRUE
    WHERE
      cl.chapter_id = ${chapterId}
    ${language ? sql`AND cl.language = ${language}` : sql``}
  `;
};
