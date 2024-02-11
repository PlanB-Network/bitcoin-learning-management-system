import { z } from 'zod';

import {
  createGetTutorial,
  createGetTutorials,
} from '@sovereign-university/api/content';

import { publicProcedure } from '../../procedures';
import { createTRPCRouter } from '../../trpc';

const getTutorialsProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/tutorials' } })
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )

  .query(async ({ ctx, input }) =>
    createGetTutorials(ctx.dependencies)(undefined, input?.language),
  );

const getTutorialsByCategoryProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/tutorials/{category}' } })
  .input(
    z.object({
      category: z.string(),
      language: z.string().optional(),
    }),
  )

  .query(async ({ ctx, input }) =>
    createGetTutorials(ctx.dependencies)(input.category, input.language),
  );

const getTutorialProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/tutorials/{category}/{name}/{language}',
    },
  })
  .input(
    z.object({
      category: z.string(),
      name: z.string(),
      language: z.string(),
    }),
  )

  .query(async ({ ctx, input }) =>
    createGetTutorial(ctx.dependencies)({
      category: input.category,
      name: input.name,
      language: input.language,
    }),
  );

export const tutorialsRouter = createTRPCRouter({
  getTutorialsByCategory: getTutorialsByCategoryProcedure,
  getTutorials: getTutorialsProcedure,
  getTutorial: getTutorialProcedure,
});
