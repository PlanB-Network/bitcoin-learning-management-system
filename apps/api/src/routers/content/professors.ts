import { z } from 'zod';

import {
  createGetProfessor,
  createGetProfessors,
} from '@sovereign-university/content';
import {
  formattedProfessorSchema,
  joinedCourseSchema,
  joinedTutorialSchema,
} from '@sovereign-university/schemas';

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
  .output(formattedProfessorSchema.array())
  .query(async ({ ctx, input }) =>
    createGetProfessors(ctx.dependencies)(input?.language),
  );

const getProfessorProcedure = publicProcedure
  .input(
    z.object({
      professorId: z.number(),
      language: z.string(),
    }),
  )
  .output(
    formattedProfessorSchema.merge(
      z.object({
        courses: joinedCourseSchema
          .merge(z.object({ professors: formattedProfessorSchema.array() }))
          .array(),
        tutorials: joinedTutorialSchema.omit({ rawContent: true }).array(),
      }),
    ),
  )
  .query(async ({ ctx, input }) =>
    createGetProfessor(ctx.dependencies)(input.professorId, input.language),
  );

export const professorsRouter = createTRPCRouter({
  getProfessors: getProfessorsProcedure,
  getProfessor: getProfessorProcedure,
});
