import { sql } from '@blms/database';
import type { JoinedProject } from '@blms/types';

export const getProjectQuery = (language?: string) => {
  return sql<JoinedProject[]>`
    SELECT
      r.id,
      r.path,
      bl.language,
      b.name,
      b.category,
      COALESCE(b.languages, '{}') AS languages,
      b.website_url,
      b.twitter_url,
      b.github_url,
      b.nostr,
      b.address_line_1,
      b.address_line_2,
      b.address_line_3,
      b.original_language,
      bl.description,
      r.last_updated,
      r.last_commit,
      ARRAY_AGG(t.name) AS tags
    FROM content.projects b
    JOIN content.resources r ON r.id = b.resource_id
    JOIN content.projects_localized bl ON bl.id = b.id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    ${language ? sql`WHERE bl.language = LOWER(${language})` : sql``}
    GROUP BY
      r.id,
      bl.language,
      b.name,
      b.category,
      b.languages,
      b.website_url,
      b.twitter_url,
      b.github_url,
      b.nostr,
      b.address_line_1,
      b.address_line_2,
      b.address_line_3,
      b.original_language,
      bl.description
  `;
};
