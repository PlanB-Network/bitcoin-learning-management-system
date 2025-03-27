import { sql } from '@blms/database';
import type { JoinedNewsletter } from '@blms/types';

export const getNewslettersQuery = () => {
  return sql<JoinedNewsletter[]>`
    SELECT
      r.id,
      r.path,
      n.id AS uuid,
      n.language,
      n.level,
      n.author,
      n.title,
      n.description,
      n.website_url,
      n.publication_date,
      n.tags,
      n.contributors,
      COALESCE(
        (SELECT pr.name FROM content.projects pr WHERE pr.id = n.project_id LIMIT 1),
        ''
        ) AS project_name,
      r.last_updated,
      r.last_commit
    FROM content.newsletters n
    JOIN content.resources r ON r.id = n.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    GROUP BY
      r.id,
      r.path,
      n.id,
      n.language,
      n.level,
      n.author,
      n.title,
      n.description,
      n.website_url,
      n.publication_date,
      n.tags,
      n.contributors,
      n.project_id
  `;
};
