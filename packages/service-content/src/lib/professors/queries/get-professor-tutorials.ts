import { sql } from '@blms/database';
import type { JoinedTutorial } from '@blms/types';

export const getProfessorTutorialsQuery = ({
  id,
  professorId,
  language,
}: {
  language?: string;
} & (
  | {
      id?: undefined;
      professorId: string;
    }
  | {
      id: string;
      professorId?: undefined;
    }
)) => {
  const whereClauses = [];

  if (id !== undefined) {
    whereClauses.push(sql`t.id = ${id}`);
  }
  if (professorId !== undefined) {
    whereClauses.push(sql`t.professor_id = ${professorId}`);
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
      t.professor_id,
      t.credit_link,
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
      t.professor_id,
      t.credit_link,
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
