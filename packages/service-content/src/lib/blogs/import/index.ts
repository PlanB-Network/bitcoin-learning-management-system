import matter from 'gray-matter';

import { firstRow, sql } from '@blms/database';
import type { Blog, ChangedFile } from '@blms/types';

import type { Language } from '../../const.js';
import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils.js';

import { createProcessMainFile } from './main.js';

interface BlogDetails {
  category: string;
  path: string;
  fullPath: string;
  language?: Language;
}

export interface ChangedBlog extends ChangedContent {
  name: string;
  category: string;
}

/**
 * Parse course details from path
 *
 * @param path - Path of the file
 * @returns Resource details
 */
export const parseDetailsFromPath = (path: string): BlogDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (blogs/)
  if (pathElements.length < 4) {
    throw new Error('Invalid resource path');
  }

  // If pathElements has 'assets', get the path until 'assets'
  // If not, get the direct parent of the file
  const pathIndex = pathElements.indexOf('assets');
  const pathEnd = pathIndex > -1 ? pathIndex : pathElements.length - 1;
  const blogElements = pathElements.slice(0, pathEnd);

  return {
    category: pathElements[1],
    path: blogElements.join('/'),
    fullPath: pathElements.join('/'),
    language: pathElements
      .at(-1)
      ?.replace(/\..*/, '')
      .toLowerCase() as Language,
  };
};

export const groupByBlog = (files: ChangedFile[], errors: string[]) => {
  const blogsFiles = files.filter(
    (item) => getContentType(item.path) === 'blogposts',
  );

  const groupedBlogs = new Map<string, ChangedBlog>();
  for (const file of blogsFiles) {
    try {
      const {
        category,
        path: blogPath,
        fullPath,
        language,
      } = parseDetailsFromPath(file.path);

      const blog: ChangedBlog = groupedBlogs.get(blogPath) || {
        type: 'blogposts',
        name: blogPath.split('/').at(-1) as string,
        category,
        path: blogPath,
        fullPath,
        files: [],
      };

      blog.files.push({
        ...file,
        path: getRelativePath(file.path, blogPath),
        language,
      });

      groupedBlogs.set(blogPath, blog);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedBlogs.values()];
};

export const createUpdateBlogs = ({ postgres }: Dependencies) => {
  return async (blog: ChangedBlog, errors: string[]) => {
    const { main, files } = separateContentFiles(blog, 'post.yml');

    return postgres
      .begin(async (transaction) => {
        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(blog, main);
        } catch (error) {
          errors.push(`Error processing file(blogs 1) ${blog?.path}: ${error}`);
          return;
        }

        const id = await transaction<Blog[]>`
          SELECT id FROM content.blogs WHERE path = ${blog.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(`Blog not found for path ${blog.path}`);
        }

        for (const file of files) {
          try {
            const header = matter(file.data, { excerpt: false });

            await transaction`
          INSERT INTO content.blogs_localized (
            blog_id, language, title, description, raw_content
          )
          VALUES (
            ${id},
            ${file.language?.toLowerCase()},
            ${header.data['name']},
            ${header.data['description']},
            ${header.content.trim()}
          )
          ON CONFLICT (blog_id, language) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            raw_content = EXCLUDED.raw_content
        `;
          } catch (error) {
            errors.push(
              `Error processing file(blogs 2) ${file?.path} in blog ${blog.fullPath} : ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};

export const createDeleteBlogs = ({ postgres }: Dependencies) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`DELETE FROM content.blogs WHERE last_sync < ${sync_date}
      `,
      );
    } catch {
      errors.push(`Error deleting blogs`);
    }
  };
};
