import { sql } from '@blms/database';
import type { JoinedPodcast } from '@blms/types';

export const getPodcastQuery = (id: number, language?: string) => {
  return sql<JoinedPodcast[]>`
    WITH ranked_podcasts AS (
      SELECT
        r.id,
        r.path,
        p.language,
        p.name,
        p.host,
        p.description,
        p.website_url,
        p.twitter_url,
        p.podcast_url,
        p.nostr,
        r.last_updated,
        r.last_commit,
        ARRAY_AGG(t.name) AS tags,
        ROW_NUMBER() OVER (
          PARTITION BY r.id
          ORDER BY CASE WHEN p.language = ${language} THEN 1 ELSE 2 END
        ) AS rank
      FROM content.podcasts p
      JOIN content.resources r ON r.id = p.resource_id
      LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
      LEFT JOIN content.tags t ON t.id = rt.tag_id
      WHERE r.id = ${id}
      GROUP BY r.id, r.path, p.language, p.name, p.host, p.description,
        p.website_url, p.twitter_url, p.podcast_url, p.nostr
    )
    SELECT *
    FROM ranked_podcasts
    WHERE rank = 1;
  `;
};
