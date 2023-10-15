import { sql } from '@sovereign-university/database';
import { JoinedProfessor } from '@sovereign-university/types';

export const getProfessorQuery = (id: number, language?: string) => {
  return sql<JoinedProfessor[]>`
    SELECT 
      p.*, pl.bio, pl.short_bio, ARRAY_AGG(t.name) AS tags
    FROM content.professors p
    JOIN content.professors_localized pl ON pl.professor_id = p.id
    LEFT JOIN content.professor_tags rt ON rt.professor_id = p.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE p.id = ${id}
    ${language ? sql`AND pl.language = ${language}` : sql``}
    GROUP BY p.id, pl.language, pl.bio, pl.short_bio
  `;
};
