import { sql } from '@blms/database';
import type { JoinedResearchPaper } from '@blms/types';

export const getResearchPapersQuery = () => {
  return sql<JoinedResearchPaper[]>`
    SELECT
      r.id,
      r.path,
      rp.id AS uuid,
      rp.title,
      rp.abstract,
      rp.authors,
      rp.publication_date,
      rp.source,
      rp.language,
      rp.topics,
      rp.type,
      rp.paper_url,
      rp.bib_url,
      r.last_updated,
      r.last_commit,
      ARRAY_AGG(t.name) AS tags
    FROM content.research_papers rp
    JOIN content.resources r ON r.id = rp.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id

    GROUP BY
      r.id,
      r.path,
      rp.id,
      rp.title,
      rp.abstract,
      rp.authors,
      rp.publication_date,
      rp.source,
      rp.language,
      rp.topics,
      rp.type,
      rp.paper_url,
      rp.bib_url
  `;
};
