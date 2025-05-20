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
    WITH distinct_chapters AS (
      SELECT DISTINCT ON (ch.chapter_id)
        ch.part_id,
        c.chapter_id,
        part_index,
        chapter_index,
        c.language,
        c.title,
        c.sections,
        c.release_place,
        c.raw_content,
        c.is_online,
        c.is_in_person,
        c.is_course_review,
        c.is_course_exam,
        c.is_course_conclusion,
        c.is_single_trial_exam,
        c.rate_weight,
        c.is_gdpr_compliance,
        c.custom_tc_disclaimer,
        c.start_date,
        c.end_date,
        c.release_date,
        c.timezone,
        c.address_line_1,
        c.address_line_2,
        c.address_line_3,
        c.live_url,
        c.chat_url,
        c.available_seats,
        c.remaining_seats,
        c.live_language,
        cl.title as part_title
      FROM content.course_chapters_localized c
      LEFT JOIN content.course_chapters ch
        ON c.chapter_id = ch.chapter_id
      LEFT JOIN content.course_parts cp
        ON ch.part_id = cp.part_id
      LEFT JOIN content.course_parts_localized cl
        ON c.course_id = cl.course_id
        AND c.language = cl.language
        AND ch.part_id = cl.part_id
      LEFT JOIN content.courses co
        ON c.course_id = co.id
      WHERE c.course_id = ${courseId}
        AND c.language = (
          CASE
            WHEN ${language != null} THEN LOWER(${language})
            ELSE co.original_language
          END
        )
        ${partId ? sql`AND ch.part_id = ${partId}` : sql``}
      ORDER BY
        ch.chapter_id,
        CASE
          WHEN ${language ? sql`c.language = LOWER(${language})` : sql`false`} THEN 1
          WHEN c.language = co.original_language THEN 2
          ELSE 3
        END,
        part_index,
        chapter_index
    )
    SELECT *
    FROM distinct_chapters
    ORDER BY part_index, chapter_index ASC
  `;
};
