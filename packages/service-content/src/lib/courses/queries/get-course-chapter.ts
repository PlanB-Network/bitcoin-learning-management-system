import { sql } from '@blms/database';
import type { JoinedCourseChapterWithContent } from '@blms/types';

export const getCourseChapterQuery = (chapterId: string, language?: string) => {
  return sql<JoinedCourseChapterWithContent[]>`
    SELECT DISTINCT ON (cl.chapter_id)
      cl.course_id,
      ch.part_id,
      cl.chapter_id,
      part_index,
      chapter_index,
      cl.language,
      title,
      sections,
      release_place,
      raw_content,
      is_online,
      is_in_person,
      is_course_review,
      is_course_exam,
      is_course_conclusion,
      cl.start_date,
      cl.end_date,
      timezone,
      address_line_1,
      address_line_2,
      address_line_3,
      live_url,
      chat_url,
      cl.available_seats,
      cl.remaining_seats,
      live_language,
      c.last_updated,
      c.last_commit,
      COALESCE(cp_agg.professors, ARRAY[]::varchar[20]) AS professors
    FROM content.course_chapters_localized cl
    JOIN content.courses c ON c.id = cl.course_id
    LEFT JOIN content.course_chapters ch
      ON cl.chapter_id = ch.chapter_id
    LEFT JOIN content.course_parts cpa
      ON ch.part_id = cpa.part_id
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(cp.contributor_id) AS professors
      FROM content.course_chapters_localized_professors cp
      WHERE cp.chapter_id = ${chapterId}
        AND ${
          language
            ? sql`(cp.language = LOWER(${language}) OR cp.language = cl.language)`
            : sql`cp.language = cl.language`
        }
    ) AS cp_agg ON TRUE
    WHERE cl.chapter_id = ${chapterId}
      ${
        language
          ? sql`AND (cl.language = LOWER(${language}) OR cl.language = c.original_language)`
          : sql``
      }
    ORDER BY
      cl.chapter_id,
      CASE
        WHEN ${language ? sql`cl.language = LOWER(${language})` : sql`false`} THEN 1
        WHEN cl.language = c.original_language THEN 2
        ELSE 3
      END
  `;
};
