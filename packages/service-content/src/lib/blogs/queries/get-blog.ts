import { sql } from '@blms/database';
import type { JoinedBlog } from '@blms/types';

export const getBlogQuery = (
  category: string,
  name: string,
  language?: string,
) => {
  return sql<JoinedBlog[]>`
      SELECT
          b.old_id,
          b.path,
          b.name,
          bl.language,
          b.category,
          b.author,
          bl.title,
          bl.description,
          bl.raw_content,
          b.last_updated,
          b.last_commit,
          b.date,
          COALESCE(tag_agg.tags, ARRAY[]::text[]) AS tags
      FROM content.blogs b
      JOIN content.blogs_localized bl ON b.old_id = bl.blog_old_id

      -- Lateral join for aggregating tags
      LEFT JOIN LATERAL (
          SELECT ARRAY_AGG(bg.name) AS tags
          FROM content.blog_tags bt
          JOIN content.tags bg ON bg.id = bt.tag_id
          WHERE bt.blog_old_id = b.old_id
      ) AS tag_agg ON TRUE

      WHERE b.category = ${category} AND b.name = ${name}
      ${language ? sql`AND bl.language = LOWER(${language})` : sql``}
      GROUP BY
          b.old_id,
          b.path,
          b.name,
          bl.language,
          b.category,
          b.author,
          bl.title,
          bl.description,
          bl.raw_content,
          b.last_updated,
          b.last_commit,
          b.date,
          tag_agg.tags
  `;
};
