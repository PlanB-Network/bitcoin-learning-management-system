import { z } from 'zod';

import type { GetProfessorOutput } from '@sovereign-university/content';
import {
  createGetProfessor,
  createGetProfessors,
} from '@sovereign-university/content';
import {
  formattedProfessorSchema,
  joinedCourseSchema,
  joinedTutorialLightSchema,
} from '@sovereign-university/schemas';
import type { FormattedProfessor } from '@sovereign-university/types';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getProfessorsProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output<Parser<FormattedProfessor[]>>(formattedProfessorSchema.array())
  .query(({ ctx, input }) =>
    createGetProfessors(ctx.dependencies)(input?.language),
  );

const getProfessorProcedure = publicProcedure
  .input(
    z.object({
      professorId: z.number(),
      language: z.string(),
    }),
  )
  .output<Parser<GetProfessorOutput>>(
    formattedProfessorSchema.merge(
      z.object({
        courses: joinedCourseSchema.array(),
        tutorials: joinedTutorialLightSchema.array(),
      }),
    ),
  )
  .query(({ ctx, input }) =>
    createGetProfessor(ctx.dependencies)(input.professorId, input.language),
  );

export const professorsRouter = createTRPCRouter({
  getProfessors: getProfessorsProcedure,
  getProfessor: getProfessorProcedure,
});
