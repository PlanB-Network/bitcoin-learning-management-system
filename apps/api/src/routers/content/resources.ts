import { z } from 'zod';

import {
  createGetBook,
  createGetBooks,
  createGetBuilder,
  createGetBuilders,
  createGetPodcast,
  createGetPodcasts,
} from '@sovereign-university/content';
import {
  joinedBookSchema,
  joinedBuilderSchema,
  joinedPodcastSchema,
} from '@sovereign-university/schemas';

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
  getBooks: createGetResourcesProcedure()
    .output(
      joinedBookSchema
        .merge(z.object({ cover: z.string().optional() }))
        .array(),
    )
    .query(async ({ ctx, input }) =>
      createGetBooks(ctx.dependencies)(input?.language),
    ),
  getBook: createGetResourceProcedure()
    .output(joinedBookSchema.merge(z.object({ cover: z.string().optional() })))
    .query(async ({ ctx, input }) =>
      createGetBook(ctx.dependencies)(input.id, input.language),
    ),
  // Builders
  getBuilders: createGetResourcesProcedure()
    .output(joinedBuilderSchema.merge(z.object({ logo: z.string() })).array())
    .query(async ({ ctx, input }) =>
      createGetBuilders(ctx.dependencies)(input?.language),
    ),
  getBuilder: createGetResourceProcedure()
    .output(joinedBuilderSchema.merge(z.object({ logo: z.string() })))
    .query(async ({ ctx, input }) =>
      createGetBuilder(ctx.dependencies)(input.id, input.language),
    ),
  // Podcasts
  getPodcasts: createGetResourcesProcedure()
    .output(joinedPodcastSchema.merge(z.object({ logo: z.string() })).array())
    .query(async ({ ctx, input }) =>
      createGetPodcasts(ctx.dependencies)(input?.language),
    ),
  getPodcast: createGetResourceProcedure()
    .output(joinedPodcastSchema.merge(z.object({ logo: z.string() })))
    .query(async ({ ctx, input }) =>
      createGetPodcast(ctx.dependencies)(input.id, input.language),
    ),
});
