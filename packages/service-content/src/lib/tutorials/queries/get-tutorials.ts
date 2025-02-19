import { sql } from '@blms/database';
import type {
  JoinedTutorialLight,
  TutorialWithProfessorName,
} from '@blms/types';

import { camelToSnakeCase } from '../../utils.js';

interface Cursor {
  id: string;
  value: string | number;
}

export const getTutorialsQuery = (category?: string, language?: string) => {
  return sql<JoinedTutorialLight[]>`
      SELECT
          t.id,
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

      ${category ? sql`WHERE t.category = ${category}` : sql``}
        ${
          language
            ? category
              ? sql`AND tl.language = LOWER(${language})`
              : sql`WHERE tl.language = LOWER(${language})`
            : sql``
        }

      GROUP BY
          t.id,
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

export const getSortedTutorialsWithProfessorNameQuery = (
  language: string,
  search: string,
  orderField:
    | 'category'
    | 'professorName'
    | 'title'
    | 'likeCount'
    | 'dislikeCount',
  orderDirection: 'asc' | 'desc',
  limit?: number,
  cursor?: Cursor,
  professorId?: string,
) => {
  const searchPattern = `%${search}%`;
  const orderFieldCamelCased = camelToSnakeCase(orderField);

  const comparisonOperator = orderDirection === 'asc' ? sql`>` : sql`<`;
  const cursorCondition = cursor
    ? sql`
      AND (
        ${sql(orderFieldCamelCased)} ${comparisonOperator} ${cursor.value}
        OR (
          ${sql(orderFieldCamelCased)} = ${cursor.value}
          AND id ${comparisonOperator} ${cursor.id}
        )
      )
    `
    : sql``;

  const professorIdCondition = professorId
    ? sql`AND professor_id = ${professorId}`
    : sql``;

  const orderDirectionKeyword = orderDirection === 'asc' ? sql`ASC` : sql`DESC`;
  const orderByClause = sql`${sql(orderFieldCamelCased)} ${orderDirectionKeyword}, id ${orderDirectionKeyword}`;

  return sql<TutorialWithProfessorName[]>`
    WITH tutorials_with_professor AS (
      SELECT
        t.id,
        t.logo_url,
        t.path,
        t.name,
        tl.title,
        tl.language,
        t.category,
        t.subcategory,
        COALESCE(likes_agg.like_count, 0) AS like_count,
        COALESCE(likes_agg.dislike_count, 0) AS dislike_count,
        COALESCE(professor.name, '') AS professor_name,
        COALESCE(professor.id, null) AS professor_id
      FROM content.tutorials t
      JOIN content.tutorials_localized tl ON t.id = tl.tutorial_id

      -- Lateral join for aggregating likes and dislikes
      LEFT JOIN LATERAL (
          SELECT
              COUNT(*) FILTER (WHERE tld.liked = true) AS like_count,
              COUNT(*) FILTER (WHERE tld.liked = false) AS dislike_count
          FROM content.tutorial_likes_dislikes tld
          WHERE tld.tutorial_id = t.id
      ) AS likes_agg ON TRUE

      -- Lateral join for fetching the professor name
      LEFT JOIN LATERAL (
          SELECT
              p.name,
              p.id
          FROM content.professors p
          JOIN content.tutorial_credits tc ON tc.contributor_id = p.contributor_id
          WHERE tc.tutorial_id = t.id
          LIMIT 1
      ) AS professor ON TRUE

      WHERE
        tl.language = LOWER(${language})
        AND (t.name ILIKE ${searchPattern}
          OR t.category ILIKE ${searchPattern}
          OR t.subcategory ILIKE ${searchPattern})
      GROUP BY
          t.id,
          t.logo_url,
          t.name,
          tl.language,
          t.category,
          t.subcategory,
          tl.title,
          likes_agg.like_count,
          likes_agg.dislike_count,
          professor.name,
          professor.id
    )
    SELECT *
    FROM tutorials_with_professor

    WHERE 1 = 1
      ${cursorCondition}
      ${professorIdCondition}

    ORDER BY ${orderByClause}

    ${limit && sql`LIMIT ${limit}`}
  `;
};
