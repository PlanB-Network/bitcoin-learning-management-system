import { sql } from '@blms/database';
import type { JoinedMovie } from '@blms/types';

export const getMovieQuery = (id: string) => {
  return sql<JoinedMovie[]>`
    SELECT
      r.id, r.path, m.id as uuid, m.language, m.title, m.description, m.author, m.duration, m.publication_year, m.platform, m.trailer, r.last_updated, r.last_commit,
      ARRAY_AGG(t.name) AS tags
    FROM content.movies m
    JOIN content.resources r ON r.id = m.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE r.id = ${id}
    GROUP BY r.id, m.id, m.language, m.title, m.description, m.author, m.duration, m.publication_year, m.platform, m.trailer
  `;
};
