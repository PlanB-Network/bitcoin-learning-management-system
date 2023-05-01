import { z } from 'zod';

import { createGetBooks } from '../../services/content/resources';
import { createTRPCRouter, publicProcedure } from '../../trpc';

const resourceType = z.enum(['book']);
const getResourcesRequestSchema = z.object({
  type: resourceType,
  language: z.string().optional(),
});

type ResourceType = z.infer<typeof resourceType>;

const getResourcesResponseSchema = z.array(z.any());

const getResourcesProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/resources' } })
  .input(getResourcesRequestSchema)
  .output(getResourcesResponseSchema)
  .query(async ({ ctx, input }) => {
    const { type } = input;

    const getResourceHandler = (resourceType: ResourceType) => {
      switch (resourceType) {
        case 'book':
          return createGetBooks(ctx.dependencies);
        default:
          return assertNever(resourceType);
      }
    };

    const handler = getResourceHandler(type);
    return handler();
  });

export const resourcesRouter = createTRPCRouter({
  getResources: getResourcesProcedure,
});

function assertNever(value: never): never {
  throw new Error(`Unsupported value: ${JSON.stringify(value)}`);
}
