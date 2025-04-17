import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { Blog, ChangedFile } from '@blms/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedBlog } from './index.js';

interface BlogMain {
  id: string;
  date?: string;
  author?: string;
  tags?: string[];
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (blog: ChangedBlog, file?: ChangedFile) => {
    if (!file) return;

    const parsedBlog = await yamlToObject<BlogMain>(file);

    const lastUpdated = blog.files.sort((a, b) => b.time - a.time)[0];

    const result = await transaction<Blog[]>`
        INSERT INTO content.blogs (
          id, path, category, author, last_updated, last_commit, last_sync, created_at, date
        )
        VALUES (
          ${parsedBlog.id},
          ${blog.path},
          ${blog.category},
          ${parsedBlog.author},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW(),
          NOW(),
          ${parsedBlog.date ? parsedBlog.date : null}
        )
        ON CONFLICT (id) DO UPDATE SET
          path = EXCLUDED.path,
          category = EXCLUDED.category,
          author = EXCLUDED.author,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW(),
          date = EXCLUDED.date
        RETURNING *
      `.then(firstRow);

    if (!result) {
      throw new Error('Could not insert blog');
    }

    const blogId = result.id;

    if (parsedBlog.tags && parsedBlog.tags.length > 0) {
      const lowercaseTags = parsedBlog.tags.map((tag) => tag.toLowerCase());

      await transaction`
        DELETE FROM content.blog_tags WHERE blog_id = ${blogId}
     `;

      await transaction`
        INSERT INTO content.tags ${transaction(
          lowercaseTags.map((tag) => ({ name: tag })),
        )}
        ON CONFLICT (name) DO NOTHING
      `;

      await transaction`
        INSERT INTO content.blog_tags (blog_id, tag_id)
          SELECT ${blogId},  id
          FROM content.tags
          WHERE name = ANY(${lowercaseTags})
        ON CONFLICT DO NOTHING
      `;
    }
  };
};
