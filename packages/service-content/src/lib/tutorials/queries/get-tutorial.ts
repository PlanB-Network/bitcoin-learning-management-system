import { sql } from '@blms/database';
import type { JoinedTutorial } from '@blms/types';

export const getTutorialQuery = (id: string, language?: string) => {
  return sql<JoinedTutorial[]>`
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
        t.project_id,
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
    ${language ? sql`AND tl.language = LOWER(${language})` : sql``}
    GROUP BY
        t.id,
        t.logo_url,
        tl.language,
        t.level,
        t.category,
        t.subcategory,
        t.original_language,
        t.project_id,
        tl.title,
        tl.description,
        tl.raw_content,
        t.last_updated,
        t.last_commit,
        tag_agg.tags,
        likes_agg.like_count,
        likes_agg.dislike_count
    `;
};
