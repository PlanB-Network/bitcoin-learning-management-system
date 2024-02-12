import { z } from 'zod';

import {
  createGetProfessor,
  createGetProfessors,
} from '@sovereign-university/content';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getProfessorsProcedure = publicProcedure
  .meta({ openapi: { method: 'GET', path: '/content/professors' } })
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
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
  .query(async ({ ctx, input }) =>
    createGetProfessor(ctx.dependencies)(input.professorId, input.language),
  );

export const professorsRouter = createTRPCRouter({
  getProfessors: getProfessorsProcedure,
  getProfessor: getProfessorProcedure,
});
