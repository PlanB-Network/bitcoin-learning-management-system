import { z } from 'zod';

import { createGetBlog, createGetBlogs } from '@blms/service-content';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getBlogsProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )

  .query(({ ctx, input }) => createGetBlogs(ctx.dependencies)(input?.language));

const getBlogProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )

  .query(({ ctx, input }) =>
    createGetBlog(ctx.dependencies)({
      id: input.id,
      language: input.language,
    }),
  );

export const blogsRouter = createTRPCRouter({
  getBlogs: getBlogsProcedure,
  getBlog: getBlogProcedure,
});
