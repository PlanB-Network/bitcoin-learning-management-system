import { z } from 'zod';

import {
  createGetTutorial,
  createGetTutorials,
} from '@sovereign-university/content';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getTutorialsProcedure = publicProcedure
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
