import { sql } from '@blms/database';
import type { JoinedProfessor } from '@blms/types';

export const getProfessorQuery = (id: string, language?: string) => {
  return sql<JoinedProfessor[]>`
    SELECT
      p.*,
      pl.bio,
      pl.short_bio,
      pl.language,
      COALESCE(ca.courses_count, 0) AS courses_count,
      COALESCE(ca.courses_indexes, ARRAY[]::text[]) AS courses_indexes,
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
      SELECT
        COUNT(cp.*) AS courses_count,
        ARRAY_AGG(c.index) AS courses_indexes
      FROM content.course_professors cp
      JOIN content.courses c ON c.id = cp.course_id
      WHERE cp.professor_id = p.id
        AND c.is_archived = false
    ) ca ON TRUE

    -- Lateral join for tutorials
    LEFT JOIN LATERAL (
      SELECT COUNT(tu) AS tutorials_count
      FROM content.tutorials tu
      WHERE tu.professor_id = p.id
    ) tca ON TRUE

    -- Lateral join for lectures
    LEFT JOIN LATERAL (
      SELECT COUNT(ev) AS lectures_count
      FROM content.events ev
      WHERE ev.professor = p.id
    ) lca ON TRUE

    WHERE p.id = ${id}
    ${language ? sql`AND pl.language = LOWER(${language})` : sql``}
    GROUP BY p.id, pl.language, pl.bio, pl.short_bio, ca.courses_count, ca.courses_indexes, tca.tutorials_count, lca.lectures_count, ta.tags
  `;
};
