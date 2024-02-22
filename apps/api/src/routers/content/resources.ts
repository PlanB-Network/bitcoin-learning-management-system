import { z } from 'zod';

import {
  createGetBook,
  createGetBooks,
  createGetBuilder,
  createGetBuilders,
  createGetPodcast,
  createGetPodcasts,
} from '@sovereign-university/content';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const createGetResourcesProcedure = () => {
  return publicProcedure.input(
    z.object({ language: z.string().optional() }).optional(),
  );
};

const createGetResourceProcedure = () => {
  return publicProcedure.input(
    z.object({ id: z.number(), language: z.string() }),
  );
};

export const resourcesRouter = createTRPCRouter({
  // Books
  getBooks: createGetResourcesProcedure().query(async ({ ctx, input }) =>
    createGetBooks(ctx.dependencies)(input?.language),
  ),
  getBook: createGetResourceProcedure().query(async ({ ctx, input }) =>
    createGetBook(ctx.dependencies)(input.id, input.language),
  ),
  // Builders
  getBuilders: createGetResourcesProcedure().query(async ({ ctx, input }) =>
    createGetBuilders(ctx.dependencies)(input?.language),
  ),
  getBuilder: createGetResourceProcedure().query(async ({ ctx, input }) =>
    createGetBuilder(ctx.dependencies)(input.id, input.language),
  ),
  // Podcasts
  getPodcasts: createGetResourcesProcedure().query(async ({ ctx, input }) =>
    createGetPodcasts(ctx.dependencies)(input?.language),
  ),
  getPodcast: createGetResourceProcedure().query(async ({ ctx, input }) =>
    createGetPodcast(ctx.dependencies)(input.id, input.language),
  ),
});
