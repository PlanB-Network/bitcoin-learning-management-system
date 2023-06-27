import { z } from 'zod';

import { getTutorialsQuery } from '@sovereign-academy/database';

import { createGetTutorial } from '../../services/content';
import { createTRPCRouter, publicProcedure } from '../../trpc';

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
    ctx.dependencies.postgres.exec(getTutorialsQuery(input?.language))
  );

const getTutorialProcedure = publicProcedure
  .meta({
    openapi: { method: 'GET', path: '/content/tutorials/{id}/{language}' },
  })
  .input(
    z.object({
      id: z.number(),
      language: z.string(),
    })
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetTutorial(ctx.dependencies)(input.id, input.language)
  );

export const tutorialsRouter = createTRPCRouter({
  getTutorials: getTutorialsProcedure,
  getTutorial: getTutorialProcedure,
});
