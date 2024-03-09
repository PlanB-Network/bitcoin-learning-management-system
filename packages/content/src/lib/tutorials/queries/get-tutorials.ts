import { sql } from '@sovereign-university/database';
import type { JoinedTutorial } from '@sovereign-university/types';

export const getTutorialsQuery = (category?: string, language?: string) => {
  return sql<Array<Omit<JoinedTutorial, 'raw_content'>>>`
    WITH tutorial AS (
      SELECT 
          t.id, 
          t.path,
          t.name,
          tl.language, 
          t.level, 
          t.category, 
          t.subcategory, 
          t.builder, 
          tl.title, 
          tl.description, 
          t.last_updated, 
          t.last_commit,
          COALESCE(tag_agg.tags, ARRAY[]::text[]) AS tags
      FROM content.tutorials t
      JOIN content.tutorials_localized tl ON t.id = tl.tutorial_id

      -- Lateral join for aggregating tags
      LEFT JOIN LATERAL (
          SELECT ARRAY_AGG(tg.name) AS tags
          FROM content.tutorial_tags tt
          JOIN content.tags tg ON tg.id = tt.tag_id
          WHERE tt.tutorial_id = t.id
      ) AS tag_agg ON TRUE

      ${category ? sql`WHERE t.category = ${category}` : sql``}
        ${
          language
            ? category
              ? sql`AND tl.language = ${language}`
              : sql`WHERE tl.language = ${language}`
            : sql``
        }

      GROUP BY 
          t.id, 
          tl.language, 
          t.level, 
          t.category, 
          t.subcategory, 
          t.builder, 
          tl.title, 
          tl.description,
          t.last_updated, 
          t.last_commit,
          tag_agg.tags
    )

    SELECT 
        tutorial.*,
        row_to_json(builders) AS builder 
    FROM tutorial

    -- Lateral join for fetching builder details
    LEFT JOIN LATERAL (
        SELECT
            r.id, 
            r.path, 
            bl.language, 
            b.name, 
            b.category, 
            b.website_url, 
            b.twitter_url,
            b.github_url, 
            b.nostr, 
            bl.description, 
            r.last_updated, 
            r.last_commit
        FROM content.builders b
        JOIN content.resources r ON r.id = b.resource_id
        JOIN content.builders_localized bl ON bl.builder_id = b.resource_id
        WHERE b.name = tutorial.builder AND bl.language = tutorial.language
    ) AS builders ON TRUE
  `;
};
