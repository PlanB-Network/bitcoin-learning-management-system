import { sql } from '@blms/database';
import type { JoinedNewsletter } from '@blms/types';

export const getNewslettersQuery = (language?: string) => {
  return sql<JoinedNewsletter[]>`
    SELECT
      r.id,
      r.path,
      nl.newsletter_id,
      n.id,
      n.language,
      n.level,
      nl.description,
      n.title,
      n.author,
      n.website_url,
      n.publication_date,
      n.tags,
      n.contributors,
      r.last_updated,
      r.last_commit
    FROM content.newsletters n
    JOIN content.resources r ON r.id = n.resource_id
    JOIN content.newsletters_localized nl ON nl.newsletter_id = r.id
    ${language ? sql`WHERE n.language = ${language}` : sql``}  -- Apply language filter if provided
    GROUP BY
      r.id, r.path, nl.newsletter_id, n.id, n.language, n.level, nl.description,
      n.title, n.author, n.website_url, n.publication_date, n.tags, n.contributors,
      r.last_updated, r.last_commit;
  `;
};
