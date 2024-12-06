import { z } from 'zod';

import {
  getTutorialResponseSchema,
  joinedTutorialLightSchema,
  tutorialWithProfessorNameSchema,
} from '@blms/schemas';
import {
  createGetTutorial,
  createGetTutorials,
  createGetTutorialsWithProfessorName,
} from '@blms/service-content';
import type {
  GetTutorialResponse,
  JoinedTutorialLight,
  TutorialWithProfessorName,
} from '@blms/types';

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
  .query(({ ctx, input }) => {
    return createGetTutorials(ctx.dependencies)(undefined, input?.language);
  });

const getTutorialsByCategoryProcedure = publicProcedure
  .input(
    z.object({
      category: z.string(),
      language: z.string().optional(),
    }),
  )
  .output<Parser<JoinedTutorialLight[]>>(joinedTutorialLightSchema.array())
  .query(({ ctx, input }) => {
    return createGetTutorials(ctx.dependencies)(input.category, input.language);
  });

const getTutorialsWithProfessorNameProcedure = publicProcedure
  .input(
    z.object({
      language: z.string(),
      search: z.string(),
      orderField: z
        .enum([
          'category',
          'professorName',
          'title',
          'likeCount',
          'dislikeCount',
        ])
        .optional()
        .default('likeCount'),
      orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
      limit: z.number(),
      cursor: z
        .object({
          id: z.string(),
          value: z.union([z.string(), z.number()]),
        })
        .optional(),
      professorId: z.number().optional(),
    }),
  )
  .output<
    Parser<{
      tutorials: TutorialWithProfessorName[];
      nextCursor: { id: string; value: string | number } | null;
    }>
  >(
    z.object({
      tutorials: tutorialWithProfessorNameSchema.array(),
      nextCursor: z
        .object({
          id: z.string(),
          value: z.union([z.string(), z.number()]),
        })
        .nullable(),
    }),
  )
  .query(({ ctx, input }) => {
    return createGetTutorialsWithProfessorName(ctx.dependencies)({
      language: input.language,
      search: input.search,
      orderField: input.orderField,
      orderDirection: input.orderDirection,
      limit: input.limit,
      cursor: input.cursor,
      professorId: input.professorId,
    });
  });

const getTutorialProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<GetTutorialResponse>>(getTutorialResponseSchema)
  .query(({ ctx, input }) => {
    return createGetTutorial(ctx.dependencies)({
      id: input.id,
      language: input.language,
    });
  });

export const tutorialsRouter = createTRPCRouter({
  getTutorialsByCategory: getTutorialsByCategoryProcedure,
  getTutorialsWithProfessorName: getTutorialsWithProfessorNameProcedure,
  getTutorials: getTutorialsProcedure,
  getTutorial: getTutorialProcedure,
});
