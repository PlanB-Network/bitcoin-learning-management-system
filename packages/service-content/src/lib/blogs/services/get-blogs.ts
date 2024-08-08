/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { Dependencies } from '../../dependencies.js';
import { getBlogsQuery } from '../queries/get-blogs.js';

export const createGetBlogs = (dependencies: Dependencies) => {
  return async (language?: string) => {
    const { postgres } = dependencies;

    const blogs = await postgres.exec(getBlogsQuery(language));

    return [...blogs];
  };
};
