import { sql } from '@sovereign-university/database';
import type { JoinedCourse } from '@sovereign-university/types';

export const getCoursesQuery = (language?: string) => {
  return sql<JoinedCourse[]>`
    SELECT 
      c.id, 
      cl.language, 
      c.level, 
      c.hours,
      c.requires_payment,
      c.paid_price_euros,
      c.paid_description,
      c.paid_video_link,
      c.paid_start_date,
      c.paid_end_date,
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

    ${language ? sql`WHERE cl.language = ${language}` : sql``}

    GROUP BY 
      c.id, 
      cl.language, 
      c.level, 
      c.hours,
      c.requires_payment,
      c.paid_price_euros,
      c.paid_description,
      c.paid_video_link,
      c.paid_start_date,
      c.paid_end_date,
      cl.name, 
      cl.goal,
      cl.objectives, 
      cl.raw_description, 
      c.last_updated, 
      c.last_commit,
      cp_agg.professors
  `;
};
