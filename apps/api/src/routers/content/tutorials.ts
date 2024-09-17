import { z } from 'zod';

import {
  getTutorialResponseSchema,
  joinedTutorialLightSchema,
} from '@blms/schemas';
import { createGetTutorial, createGetTutorials } from '@blms/service-content';
import type { GetTutorialResponse, JoinedTutorialLight } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

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
  .output<Parser<JoinedTutorialLight[]>>(joinedTutorialLightSchema.array())
  .query(({ ctx, input }) =>
    createGetTutorials(ctx.dependencies)(undefined, input?.language),
  );

const getTutorialsByCategoryProcedure = publicProcedure
  .input(
    z.object({
      category: z.string(),
      language: z.string().optional(),
    }),
  )
  .output<Parser<JoinedTutorialLight[]>>(joinedTutorialLightSchema.array())
  .query(({ ctx, input }) =>
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
  .output<Parser<GetTutorialResponse>>(getTutorialResponseSchema)
  .query(({ ctx, input }) =>
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
