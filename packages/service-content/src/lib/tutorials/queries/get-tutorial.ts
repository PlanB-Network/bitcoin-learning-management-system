import { sql } from '@blms/database';
import type { JoinedTutorial } from '@blms/types';

export const getTutorialQuery = (id: string, language?: string) => {
  return sql<JoinedTutorial[]>`
      WITH tutorial AS (
        SELECT
            t.id,
            t.path,
            t.name,
            tl.language,
            t.level,
            t.category,
            t.subcategory,
            t.original_language,
            t.builder,
            tl.title,
            tl.description,
            tl.raw_content,
            t.last_updated,
            t.last_commit,
            COALESCE(tag_agg.tags, ARRAY[]::text[]) AS tags,
            COALESCE(likes_agg.like_count, 0) AS like_count,
            COALESCE(likes_agg.dislike_count, 0) AS dislike_count
        FROM content.tutorials t
        JOIN content.tutorials_localized tl ON t.id = tl.tutorial_id
        LEFT JOIN LATERAL (
            SELECT ARRAY_AGG(tg.name) AS tags
            FROM content.tutorial_tags tt
            JOIN content.tags tg ON tg.id = tt.tag_id
            WHERE tt.tutorial_id = t.id
        ) AS tag_agg ON TRUE
        LEFT JOIN LATERAL (
            SELECT
                COUNT(*) FILTER (WHERE tld.liked = true) AS like_count,
                COUNT(*) FILTER (WHERE tld.liked = false) AS dislike_count
            FROM content.tutorial_likes_dislikes tld
            WHERE tld.tutorial_id = t.id
        ) AS likes_agg ON TRUE
        WHERE t.id = ${id}
        ${language ? sql`AND tl.language = ${language}` : sql``}
        GROUP BY
            t.id,
            tl.language,
            t.level,
            t.category,
            t.subcategory,
            t.original_language,
            t.builder,
            tl.title,
            tl.description,
            tl.raw_content,
            t.last_updated,
            t.last_commit,
            tag_agg.tags,
            likes_agg.like_count,
            likes_agg.dislike_count
      )

      SELECT
          tutorial.*,
          row_to_json(builders) AS builder
      FROM tutorial
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
