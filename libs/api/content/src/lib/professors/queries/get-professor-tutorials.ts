import { sql } from '@sovereign-university/database';
import { JoinedTutorial } from '@sovereign-university/types';

export const getProfessorTutorialsQuery = ({
  id,
  contributorId,
  language,
}: {
  language?: string;
} & (
  | {
      id?: undefined;
      contributorId: string;
    }
  | {
      id: number;
      contributorId?: undefined;
    }
)) => {
  const whereClauses = [];

  if (id !== undefined) {
    whereClauses.push(sql`tc.tutorial_id = ${id}`);
  }
  if (contributorId !== undefined) {
    whereClauses.push(sql`tc.contributor_id = ${contributorId}`);
  }
  if (language !== undefined) {
    whereClauses.push(sql`tl.language = ${language}`);
  }

  const whereStatement = sql`WHERE ${whereClauses.reduce(
    (acc, clause) => sql`${acc} AND ${clause}`,
  )}`;

  return sql<Omit<JoinedTutorial, 'raw_content'>[]>`
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

      -- Join to get the tutorial credits
      JOIN content.tutorial_credits tc ON tc.tutorial_id = t.id

      -- Lateral join for aggregating tags
      LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(tg.name) AS tags
        FROM content.tutorial_tags tt
        JOIN content.tags tg ON tg.id = tt.tag_id
        WHERE tt.tutorial_id = t.id
      ) AS tag_agg ON TRUE

      ${whereStatement}

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
