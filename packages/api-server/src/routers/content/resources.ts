import { z } from 'zod';

import {
  getBookQuery,
  getBuilderQuery,
  getPodcastQuery,
} from '@sovereign-academy/database';

import {
  createGetBooks,
  createGetBuilders,
  createGetPodcasts,
} from '../../services/content';
import { createTRPCRouter, publicProcedure } from '../../trpc';

const resourceType = z.enum(['books', 'builders', 'podcasts']);
const getResourcesRequestSchema = z.object({
  category: resourceType,
  language: z.string().optional(),
});

type ResourceType = z.infer<typeof resourceType>;

const getResourcesResponseSchema = z.array(z.any());

const getResourcesProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/resources' } })
  .input(getResourcesRequestSchema)
  .output(getResourcesResponseSchema)
  .query(async ({ ctx, input }) => {
    const { category, language } = input;

    const getResourceHandler = (resourceType: ResourceType) => {
      switch (resourceType) {
        case 'books':
          return createGetBooks(ctx.dependencies);
        case 'builders':
          return createGetBuilders(ctx.dependencies);
        case 'podcasts':
          return createGetPodcasts(ctx.dependencies);
        default:
          return assertNever(resourceType);
      }
    };

    const handler = getResourceHandler(category);
    return handler(language);
  });

const getResourceProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/resources/{category}/{id}/{language}',
    },
  })
  .input(
    z.object({ category: resourceType, id: z.number(), language: z.string() })
  )
  .output(z.any())
  .query(async ({ ctx, input }) => {
    const { category, id, language } = input;

    const getResourceQuery = (resourceType: ResourceType) => {
      switch (resourceType) {
        case 'books':
          return getBookQuery;
        case 'builders':
          return getBuilderQuery;
        case 'podcasts':
          return getPodcastQuery;
        default:
          return assertNever(resourceType);
      }
    };

    const query = getResourceQuery(category);
    return ctx.dependencies.postgres.exec(query(id, language));
  });

export const resourcesRouter = createTRPCRouter({
  getResources: getResourcesProcedure,
  getResource: getResourceProcedure,
});

function assertNever(value: never): never {
  throw new Error(`Unsupported category: ${JSON.stringify(value)}`);
}
