import { z } from 'zod';

import {
  createGetProfessor,
  createGetProfessors,
} from '@sovereign-university/api/content';

import { publicProcedure } from '../../procedures';
import { createTRPCRouter } from '../../trpc';

const getProfessorsProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/professors' } })
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetProfessors(ctx.dependencies)(input?.language),
  );

const getProfessorProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/content/professors/{professorId}/{language}',
    },
  })
  .input(
    z.object({
      professorId: z.number(),
      language: z.string(),
    }),
  )
  .output(z.any())
  .query(async ({ ctx, input }) =>
    createGetProfessor(ctx.dependencies)(input.professorId, input.language),
  );

export const professorsRouter = createTRPCRouter({
  getProfessors: getProfessorsProcedure,
  getProfessor: getProfessorProcedure,
});
