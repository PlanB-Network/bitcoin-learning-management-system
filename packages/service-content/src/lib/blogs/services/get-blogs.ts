/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { JoinedBlogLight } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getBlogsQuery } from '../queries/get-blogs.js';

export const createGetBlogs = ({ postgres }: Dependencies) => {
  return (language?: string): Promise<JoinedBlogLight[]> => {
    return postgres.exec(getBlogsQuery(language));
  };
};
