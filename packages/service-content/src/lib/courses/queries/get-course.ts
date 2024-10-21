import { sql } from '@blms/database';
import type { JoinedCourseWithAll } from '@blms/types';

export const getCourseQuery = (id: string, language?: string) => {
  return sql<JoinedCourseWithAll[]>`
    SELECT
      c.id,
      cl.language,
      c.level,
      c.hours,
      c.topic,
      c.subtopic,
      c.original_language,
      c.requires_payment,
      c.format,
      c.online_price_dollars,
      c.inperson_price_dollars,
      c.paid_description,
      c.paid_video_link,
      c.paid_start_date,
      c.paid_end_date,
      c.contact,
      c.available_seats,
      c.remaining_seats,
      c.number_of_rating,
      c.sum_of_all_rating,
      COALESCE(NULLIF(c.sum_of_all_rating, 0) / NULLIF(c.number_of_rating, 0), 0) AS average_rating,
      cl.name,
      cl.goal,
      cl.objectives,
      cl.raw_description,
      c.last_updated,
      c.last_commit,
      COALESCE(cp_agg.professors, ARRAY[]::varchar[20]) as professors
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id

    -- Lateral join for aggregating professors
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(cp.contributor_id) as professors
      FROM content.course_professors cp
      WHERE cp.course_id = c.id
    ) AS cp_agg ON TRUE

    WHERE c.id = ${id}
    ${language ? sql`AND cl.language = ${language}` : sql``}

    GROUP BY
      c.id,
      cl.language,
      c.level,
      c.hours,
      c.topic,
      c.subtopic,
      c.original_language,
      c.requires_payment,
      c.format,
      c.online_price_dollars,
      c.inperson_price_dollars,
      c.paid_description,
      c.paid_video_link,
      c.paid_start_date,
      c.paid_end_date,
      c.contact,
      c.available_seats,
      c.remaining_seats,
      c.number_of_rating,
      c.sum_of_all_rating,
      cl.name,
      cl.goal,
      cl.objectives,
      cl.raw_description,
      c.last_updated,
      c.last_commit,
      cp_agg.professors
  `;
};
