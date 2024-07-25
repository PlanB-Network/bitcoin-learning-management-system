import { z } from 'zod';

import { createGetProfessor, createGetProfessors } from '@blms/content';
import { formattedProfessorSchema, fullProfessorSchema } from '@blms/schemas';
import type { FormattedProfessor, FullProfessor } from '@blms/types';

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
  .output<Parser<FullProfessor>>(fullProfessorSchema)
  .query(({ ctx, input }) =>
    createGetProfessor(ctx.dependencies)(input.professorId, input.language),
  );

export const professorsRouter = createTRPCRouter({
  getProfessors: getProfessorsProcedure,
  getProfessor: getProfessorProcedure,
});
