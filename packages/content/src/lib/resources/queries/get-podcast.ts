import { sql } from '@sovereign-university/database';
import { JoinedPodcast } from '@sovereign-university/types';

export const getPodcastQuery = (id: number, language?: string) => {
  return sql<JoinedPodcast[]>`
    SELECT 
      r.id, r.path, p.language, p.name, p.host, p.description, p.website_url, 
      p.twitter_url, p.podcast_url, p.nostr, r.last_updated, r.last_commit,
      ARRAY_AGG(t.name) AS tags
    FROM content.podcasts p
    JOIN content.resources r ON r.id = p.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE r.id = ${id}
    ${language ? sql`AND p.language = ${language}` : sql``}
    GROUP BY r.id, p.language, p.name, p.host, p.description, p.website_url,
    p.twitter_url, p.podcast_url, p.nostr
  `;
};
