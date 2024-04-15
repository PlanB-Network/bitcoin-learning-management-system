import { sql } from '@sovereign-university/database';
import type { JoinedCourseChapterWithContent } from '@sovereign-university/types';

export const getCourseChapterQuery = (
  courseId: string,
  partIndex: number,
  chapterIndex: number,
  language?: string,
) => {
  return sql<JoinedCourseChapterWithContent[]>`
    SELECT part, chapter, language, title, sections, release_place, raw_content, is_online, is_in_person, 
    start_date, end_date, timezone, address_line_1, address_line_2, address_line_3, live_url, available_seats, live_language,
    c.last_updated, c.last_commit, COALESCE(cp_agg.professors, ARRAY[]::varchar[20]) AS professors
    FROM content.course_chapters_localized
    JOIN content.courses c ON c.id = course_id
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(cp.contributor_id) AS professors
      FROM content.course_chapters_localized_professors cp
      WHERE 
        course_id = ${courseId} 
        AND part = ${partIndex}
        AND chapter = ${chapterIndex}
        AND language = ${language ? language : 'language'} -- Fallback to the chapter's language if none provided
    ) AS cp_agg ON TRUE
    WHERE
      course_id = ${courseId} 
      AND part = ${partIndex}
      AND chapter = ${chapterIndex}
    ${language ? sql`AND language = ${language}` : sql``}
  `;
};
