import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getBlogQuery } from '../queries/get-blog.js';

interface Options {
  category: string;
  name: string;
  language: string;
}

export const createGetBlog = ({ postgres }: Dependencies) => {
  return async ({ category, name, language }: Options) => {
    const blog = await postgres
      .exec(getBlogQuery(category, name, language))
      .then(firstRow);

    if (!blog) throw new Error(`Blog not found`);

    return blog;
  };
};
