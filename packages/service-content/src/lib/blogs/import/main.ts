import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { Blog, ChangedFile } from '@blms/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedBlog } from './index.js';

interface BlogMain {
  id: string;
  date?: string;
  builder?: string;
  tags?: string[];
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (blog: ChangedBlog, file?: ChangedFile) => {
    if (!file) return;

    const parsedBlog = await yamlToObject<BlogMain>(file);

    const lastUpdated = blog.files.sort((a, b) => b.time - a.time)[0];

    // TODO on conflict with id when PK
    const result = await transaction<Blog[]>`
        INSERT INTO content.blogs (
          id, path, name, category, author, last_updated, last_commit, last_sync, date
        )
        VALUES (
          ${parsedBlog.id},
          ${blog.path},
          ${blog.name},
          ${blog.category},
          ${parsedBlog.builder},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW(),
          ${parsedBlog.date ? parsedBlog.date : null}
        )
        ON CONFLICT (path) DO UPDATE SET
          id = EXCLUDED.id,
          name = EXCLUDED.name,
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

    const blogOldId = result.oldId;
    const blogId = result.id;

    if (parsedBlog.tags && parsedBlog.tags.length > 0) {
      await transaction`
        DELETE FROM content.blog_tags WHERE blog_old_id = ${blogOldId}
     `;

      await transaction`
        INSERT INTO content.tags ${transaction(
          parsedBlog.tags.map((tag) => ({ name: tag.toLowerCase() })),
        )}
        ON CONFLICT (name) DO NOTHING
      `;

      await transaction`
        INSERT INTO content.blog_tags (blog_id, blog_old_id, tag_id)
          SELECT ${blogId}, ${blogOldId}, id
          FROM content.tags
          WHERE name = ANY(${parsedBlog.tags.map((tag) => tag.toLowerCase())})
        ON CONFLICT DO NOTHING
      `;
    }
  };
};
