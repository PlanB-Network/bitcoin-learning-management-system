import { sql } from '@blms/database';
import type { JoinedCourseWithProfessorsContributorIds } from '@blms/types';

export const getCoursesQuery = (language?: string) => {
  return sql<JoinedCourseWithProfessorsContributorIds[]>`
    SELECT DISTINCT ON (c.id)
      c.id,
      c.index,
      c.is_archived,
      cl.language,
      c.level,
      c.hours,
      c.topic,
      c.subtopic,
      c.original_language,
      c.requires_payment,
      c.payment_expiration_date,
      c.published_at,
      c.format,
      c.online_price_dollars,
      c.inperson_price_dollars,
      c.paid_description,
      c.paid_video_link,
      c.start_date,
      c.end_date,
      c.contact,
      c.available_seats,
      c.remaining_seats,
      c.number_of_rating,
      c.sum_of_all_rating,
      c.is_planb_school,
      c.planb_school_markdown,
      c.is_gdpr_compliance,
      c.custom_tc_disclaimer,
      COALESCE(NULLIF(c.sum_of_all_rating::float, 0) / NULLIF(c.number_of_rating, 0), 0) AS average_rating,
      cl.name,
      cl.goal,
      cl.objectives,
      cl.raw_description,
      c.last_updated,
      c.last_commit,
      COALESCE(cp_agg.professors, ARRAY[]::uuid[]) as professors
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id

    -- Lateral join for aggregating professors
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(cp.professor_id) as professors
      FROM content.course_professors cp
      WHERE cp.course_id = c.id
    ) AS cp_agg ON TRUE

    ${language ? sql`WHERE (cl.language = LOWER(${language}) OR cl.language = c.original_language)` : sql``}

    ORDER BY
      c.id,
      CASE
        WHEN ${language ? sql`cl.language = LOWER(${language})` : sql`false`} THEN 1
        WHEN cl.language = c.original_language THEN 2
        ELSE 3
      END
  `;
};

export const getProfessorCoursesQuery = (
  courseIds: string[],
  language?: string,
) => {
  return sql<JoinedCourseWithProfessorsContributorIds[]>`
    SELECT DISTINCT ON (c.id)
      c.id,
      c.index,
      c.is_archived,
      cl.language,
      c.level,
      c.hours,
      c.topic,
      c.subtopic,
      c.original_language,
      c.requires_payment,
      c.payment_expiration_date,
      c.published_at,
      c.format,
      c.online_price_dollars,
      c.inperson_price_dollars,
      c.paid_description,
      c.paid_video_link,
      c.start_date,
      c.end_date,
      c.contact,
      c.available_seats,
      c.remaining_seats,
      c.number_of_rating,
      c.sum_of_all_rating,
      c.is_planb_school,
      c.planb_school_markdown,
      c.is_gdpr_compliance,
      c.custom_tc_disclaimer,
      COALESCE(NULLIF(c.sum_of_all_rating::float, 0) / NULLIF(c.number_of_rating, 0), 0) AS average_rating,
      cl.name,
      cl.goal,
      cl.objectives,
      cl.raw_description,
      c.last_updated,
      c.last_commit,
      COALESCE(cp_agg.professors, ARRAY[]::uuid[]) as professors
    FROM content.courses c
    JOIN content.courses_localized cl ON c.id = cl.course_id

    -- Lateral join for aggregating professors
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(cp.professor_id) as professors
      FROM content.course_professors cp
      WHERE cp.course_id = c.id
    ) AS cp_agg ON TRUE

    WHERE c.id = ANY(${courseIds})
    ${language ? sql`AND (cl.language = LOWER(${language}) OR cl.language = c.original_language)` : sql``}

    ORDER BY
      c.id,
      CASE
        WHEN ${language ? sql`cl.language = LOWER(${language})` : sql`false`} THEN 1
        WHEN cl.language = c.original_language THEN 2
        ELSE 3
      END
  `;
};
