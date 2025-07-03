import { createGetBlog, createGetBlogs } from '@blms/service-content';
import { z } from 'zod';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';

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
  getBlog: getBlogProcedure,
  getBlogs: getBlogsProcedure,
});
