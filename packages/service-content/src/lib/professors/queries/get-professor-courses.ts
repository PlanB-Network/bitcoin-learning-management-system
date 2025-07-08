import { sql } from '@blms/database';
import type { JoinedCourseProfessorId } from '@blms/types';

export const getProfessorCoursesQuery = ({
  id,
  professorId,
  language,
}: {
  language?: string;
} & (
  | {
      id?: undefined;
      professorId: string;
    }
  | {
      id: number;
      professorId?: undefined;
    }
)) => {
  const whereClauses = [];

  if (id !== undefined) {
    whereClauses.push(sql`p.id = ${id}`);
  }
  if (professorId !== undefined) {
    whereClauses.push(sql`p.id = ${professorId}`);
  }

  if (language !== undefined) {
    whereClauses.push(
      sql`(cl.language = LOWER(${language}) OR cl.language = c.original_language)`,
    );
  }

  whereClauses.push(sql`c.is_archived = false`);

  const whereStatement = sql`WHERE ${whereClauses.reduce(
    (acc, clause) => sql`${acc} AND ${clause}`,
  )}`;

  return sql<JoinedCourseProfessorId[]>`
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
      c.teaching_format,
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
      c.presentation_markdown,
      c.has_logo,
      c.is_gdpr_compliance,
      c.custom_tc_disclaimer,
      c.is_assignment_grading_published,
      c.passing_grade_threshold,
      c.assignment_weight,
      c.has_assignment,
      c.assignment_start_date,
      c.assignment_end_date,
      c.assignment_description,
      c.are_scores_calculated,
      COALESCE(NULLIF(c.sum_of_all_rating::float, 0) / NULLIF(c.number_of_rating, 0), 0) AS average_rating,
      COALESCE(
        (SELECT pr.name FROM content.projects pr WHERE pr.id = c.project_id LIMIT 1),
        ''
        ) AS project_name,
      cl.name,
      cl.goal,
      cl.objectives,
      cl.raw_description,
      c.last_updated,
      c.last_commit,
      COALESCE(cp_main_agg.professors, ARRAY[]::uuid[]) as main_professor_ids,
      COALESCE(cp_assoc_agg.professors, ARRAY[]::uuid[]) as associated_professor_ids
    FROM content.professors p

    -- Join to get the course_professors
    JOIN content.course_professors cp ON p.id = cp.professor_id

    -- Join to get the actual course details
    JOIN content.courses c ON cp.course_id = c.id

    -- Join to get the localized course details
    JOIN content.courses_localized cl ON c.id = cl.course_id

    -- Lateral join for aggregating main_professors
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(cp.professor_id) as professors
      FROM content.course_professors cp
      WHERE cp.course_id = c.id AND cp.is_coordinator = true
    ) AS cp_main_agg ON TRUE

    -- Lateral join for aggregating associated professors
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(cp.professor_id) as professors
      FROM content.course_professors cp
      WHERE cp.course_id = c.id AND cp.is_coordinator = false
    ) AS cp_assoc_agg ON TRUE

    ${whereStatement}

    ORDER BY
      c.id,
      CASE
        WHEN ${language ? sql`cl.language = LOWER(${language})` : sql`false`} THEN 1
        WHEN cl.language = c.original_language THEN 2
        ELSE 3
      END
  `;
};
