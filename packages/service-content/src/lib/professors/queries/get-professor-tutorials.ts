import { sql } from '@blms/database';
import type { JoinedTutorial } from '@blms/types';

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
      id: string;
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
    whereClauses.push(sql`tl.language = LOWER(${language})`);
  }

  const whereStatement = sql`WHERE ${whereClauses.reduce(
    (acc, clause) => sql`${acc} AND ${clause}`,
  )}`;

  return sql<Array<Omit<JoinedTutorial, 'raw_content'>>>`
    SELECT
      t.id,
      t.project_id,
      t.path,
      t.logo_url,
      t.name,
      tl.language,
      t.level,
      t.category,
      t.subcategory,
      t.original_language,
      tl.title,
      tl.description,
      t.last_updated,
      t.last_commit,
      COALESCE(tag_agg.tags, ARRAY[]::text[]) AS tags,
      COALESCE(likes_agg.like_count, 0) AS like_count,
      COALESCE(likes_agg.dislike_count, 0) AS dislike_count
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

    -- Lateral join for aggregating likes and dislikes
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*) FILTER (WHERE tld.liked = true) AS like_count,
            COUNT(*) FILTER (WHERE tld.liked = false) AS dislike_count
        FROM content.tutorial_likes_dislikes tld
        WHERE tld.tutorial_id = t.id
    ) AS likes_agg ON TRUE

    ${whereStatement}

    GROUP BY
      t.id,
      t.project_id,
      t.logo_url,
      tl.language,
      t.level,
      t.category,
      t.subcategory,
      t.original_language,
      tl.title,
      tl.description,
      t.last_updated,
      t.last_commit,
      tag_agg.tags,
      likes_agg.like_count,
      likes_agg.dislike_count
  `;
};
