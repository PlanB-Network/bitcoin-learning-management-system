import { sql } from '@blms/database';
import type { JoinedNewsletter } from '@blms/types';

export const getNewsletterQuery = (id: number, language?: string) => {
  return sql<JoinedNewsletter[]>`
    WITH ranked_newsletters AS (
      SELECT
        r.id AS resource_id,
        r.path,
        n.id AS newsletter_id,
        n.language,
        n.level,
        n.title,
        n.author,
        n.description,
        n.website_url,
        n.publication_date,
        n.contributors,
        r.last_updated,
        r.last_commit,
        ARRAY_AGG(t.name) AS tags,
        ROW_NUMBER() OVER (
          PARTITION BY r.id
          ORDER BY CASE WHEN n.language = ${language} THEN 1 ELSE 2 END
        ) AS rank
      FROM content.newsletters n
      JOIN content.resources r ON r.id = n.resource_id
      LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
      LEFT JOIN content.tags t ON t.id = rt.tag_id
      WHERE r.id = ${id}
      GROUP BY r.id, r.path, n.id, n.language, n.level, n.title, n.author, n.description,
        n.website_url, n.publication_date, n.contributors
    )
    SELECT *
    FROM ranked_newsletters
    WHERE rank = 1;
  `;
};
