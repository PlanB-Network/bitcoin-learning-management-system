import { sql } from '@blms/database';
import type { JoinedNewsletter } from '@blms/types';

export const getNewsletterMetaQuery = (id: string) => {
  return sql<JoinedNewsletter[]>`
    SELECT
      resource_id as id,
      language,
      level,
      title,
      author,
      description,
      website_url,
      publication_date,
      contributors,
      r.last_updated,
      r.last_commit,
      r.path
    FROM content.newsletters n
    JOIN content.resources r ON r.id = n.resource_id
    WHERE resource_id = ${id}
  `;
};
