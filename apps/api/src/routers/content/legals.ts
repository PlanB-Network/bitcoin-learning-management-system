import { z } from 'zod';

import { createGetLegal, createGetLegals } from '@blms/service-content';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getLegalsProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .query(({ ctx, input }) =>
    createGetLegals(ctx.dependencies)(input?.language),
  );

const getLegalProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      language: z.string(),
    }),
  )
  .query(({ ctx, input }) =>
    createGetLegal(ctx.dependencies)({
      name: input.name,
      language: input.language,
    }),
  );

export const legalsRouter = createTRPCRouter({
  getLegals: getLegalsProcedure,
  getLegal: getLegalProcedure,
});
