import { formattedProfessorSchema, fullProfessorSchema } from '@blms/schemas';
import { createGetProfessor, createGetProfessors } from '@blms/service-content';
import type { FormattedProfessor, FullProfessor } from '@blms/types';
import { z } from 'zod';

import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

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
      language: z.string().optional(),
      professorId: z.string(),
    }),
  )
  .output<Parser<FullProfessor>>(fullProfessorSchema)
  .query(({ ctx, input }) =>
    createGetProfessor(ctx.dependencies)(input.professorId, input.language),
  );

export const professorsRouter = createTRPCRouter({
  getProfessor: getProfessorProcedure,
  getProfessors: getProfessorsProcedure,
});
