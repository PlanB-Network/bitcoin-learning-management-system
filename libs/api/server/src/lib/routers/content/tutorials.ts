import { z } from 'zod';

import {
  createGetTutorial,
  createGetTutorials,
} from '@sovereign-university/api/content';
import { createTRPCRouter } from '../../trpc';
import { publicProcedure } from '../../procedures';

const getTutorialsProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/tutorials' } })
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional()
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetTutorials(ctx.dependencies)(undefined, input?.language)
  );

const getTutorialsByCategoryProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/tutorials/{category}' } })
  .input(
    z.object({
      category: z.string(),
      language: z.string().optional(),
    })
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetTutorials(ctx.dependencies)(input.category, input.language)
  );

const getTutorialProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/tutorials/{tutorialId}/{language}',
    },
  })
  .input(
    z.object({
      tutorialId: z.number(),
      language: z.string(),
    })
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetTutorial(ctx.dependencies)(input.tutorialId, input.language)
  );

export const tutorialsRouter = createTRPCRouter({
  getTutorialsByCategory: getTutorialsByCategoryProcedure,
  getTutorials: getTutorialsProcedure,
  getTutorial: getTutorialProcedure,
});
