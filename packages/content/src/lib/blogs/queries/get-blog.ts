import { sql } from '@blms/database';
import type { JoinedBlog } from '@blms/types';

export const getBlogQuery = (
  category: string,
  name: string,
  language?: string,
) => {
  return sql<JoinedBlog[]>`
      SELECT 
          b.id, 
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
          COALESCE(tag_agg.tags, ARRAY[]::text[]) AS tags
      FROM content.blogs b
      JOIN content.blogs_localized bl ON b.id = bl.blog_id

      -- Lateral join for aggregating tags
      LEFT JOIN LATERAL (
          SELECT ARRAY_AGG(bg.name) AS tags
          FROM content.blog_tags bt
          JOIN content.tags bg ON bg.id = bt.tag_id
          WHERE bt.blog_id = b.id
      ) AS tag_agg ON TRUE

      WHERE b.category = ${category} AND b.name = ${name} 
      ${language ? sql`AND bl.language = ${language}` : sql``}
      GROUP BY 
          b.id, 
          bl.language,  
          b.category, 
          b.author, 
          bl.title, 
          bl.description, 
          bl.raw_content, 
          b.last_updated, 
          b.last_commit,
          tag_agg.tags
  `;
};
