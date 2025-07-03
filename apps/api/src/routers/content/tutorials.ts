import { SortDirection } from '@blms/constants';
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
import { z } from 'zod';

import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

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
      cursor: z
        .object({
          id: z.string(),
          value: z.union([z.string(), z.number()]),
        })
        .optional(),
      language: z.string(),
      limit: z.number(),
      orderDirection: z
        .nativeEnum(SortDirection)
        .optional()
        .default(SortDirection.Asc),
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
      professorId: z.string().optional(),
      search: z.string(),
    }),
  )
  .output<
    Parser<{
      tutorials: TutorialWithProfessorName[];
      nextCursor: { id: string; value: string | number } | null;
    }>
  >(
    z.object({
      nextCursor: z
        .object({
          id: z.string(),
          value: z.union([z.string(), z.number()]),
        })
        .nullable(),
      tutorials: tutorialWithProfessorNameSchema.array(),
    }),
  )
  .query(({ ctx, input }) => {
    return createGetTutorialsWithProfessorName(ctx.dependencies)({
      cursor: input.cursor,
      language: input.language,
      limit: input.limit,
      orderDirection: input.orderDirection,
      orderField: input.orderField,
      professorId: input.professorId,
      search: input.search,
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
  getTutorial: getTutorialProcedure,
  getTutorials: getTutorialsProcedure,
  getTutorialsByCategory: getTutorialsByCategoryProcedure,
  getTutorialsWithProfessorName: getTutorialsWithProfessorNameProcedure,
});
