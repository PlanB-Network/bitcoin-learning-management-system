import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getBlogQuery } from '../queries/get-blog.js';

interface Options {
  id: string;
  language: string;
}

export const createGetBlog = ({ postgres }: Dependencies) => {
  return async ({ id, language }: Options) => {
    const blog = await postgres.exec(getBlogQuery(id, language)).then(firstRow);

    if (!blog) {
      throw new Error('Blog not found');
    }

    return blog;
  };
};
