import { sql } from '@blms/database';
import type { JoinedTutorialCredit } from '@blms/types';

export const getCreditsQuery = (id: string, language?: string) => {
  return sql<JoinedTutorialCredit[]>`
    SELECT 
        tc.*,
        row_to_json(professor) AS professor
    FROM content.tutorial_credits tc
    LEFT JOIN LATERAL (
      SELECT 
        p.*, 
        pl.bio, 
        pl.short_bio, 
        COALESCE(ca.courses_count, 0) AS courses_count, 
        COALESCE(tca.tutorials_count, 0) AS tutorials_count,
        COALESCE(lca.lectures_count, 0) AS lectures_count,
        COALESCE(ta.tags, ARRAY[]::text[]) AS tags
      FROM content.professors p
      JOIN content.professors_localized pl ON pl.professor_id = p.id

      -- Lateral join for tags
      LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(t.name) AS tags
        FROM content.professor_tags rt
        JOIN content.tags t ON t.id = rt.tag_id
        WHERE rt.professor_id = p.id
      ) ta ON TRUE

      -- Lateral join for courses
      LEFT JOIN LATERAL (
        SELECT COUNT(cp) AS courses_count
        FROM content.course_professors cp
        WHERE cp.contributor_id = p.contributor_id
      ) ca ON TRUE

      -- Lateral join for tutorials
      LEFT JOIN LATERAL (
        SELECT COUNT(tc) AS tutorials_count
        FROM content.tutorial_credits tc
        WHERE tc.contributor_id = p.contributor_id
      ) tca ON TRUE  

      -- Lateral join for lectures
      LEFT JOIN LATERAL (
      SELECT COUNT(DISTINCT clp.chapter_id) AS lectures_count
      FROM content.course_chapters_localized_professors clp
      WHERE clp.contributor_id = p.contributor_id
    ) lca ON TRUE

      WHERE tc.contributor_id = p.contributor_id
      ${language ? sql`AND pl.language = ${language}` : sql``}
      GROUP BY p.id, pl.language, pl.bio, pl.short_bio, ca.courses_count, tca.tutorials_count, lca.lectures_count, ta.tags
    ) AS professor ON TRUE
    WHERE tc.tutorial_id = ${id};
  `;
};
