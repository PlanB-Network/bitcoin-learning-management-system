import { sql } from '@blms/database';
import type { JoinedNewsletter } from '@blms/types';

export const getNewsletterQuery = (id: string) => {
  return sql<JoinedNewsletter[]>`
    SELECT
      r.id,
      r.path,
      n.id AS uuid,
      n.language,
      n.level,
      n.title,
      n.author,
      n.description,
      n.website_url,
      n.publication_date,
      n.contributors,
      COALESCE(
        (SELECT pr.name FROM content.projects pr WHERE pr.id = n.project_id LIMIT 1),
        ''
        ) AS project_name,
      r.last_updated,
      r.last_commit,
      ARRAY_AGG(t.name) AS tags
    FROM content.newsletters n
    JOIN content.resources r ON r.id = n.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE r.id = ${id}
    GROUP BY
      r.id,
      n.id,
      n.language,
      n.level,
      n.title,
      n.author,
      n.description,
      n.website_url,
      n.publication_date,
      n.contributors,
      n.project_id,
      r.last_updated,
      r.last_commit
  `;
};
