import { joinedLegalSchema } from '@blms/schemas';
import { createGetLegal } from '@blms/service-content';
import type { JoinedLegal } from '@blms/types';
import { z } from 'zod';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getLegalProcedure = publicProcedure
  .input(
    z.object({
      language: z.string(),
      name: z.string(),
    }),
  )
  .output<Parser<JoinedLegal>>(joinedLegalSchema)
  .query(({ ctx, input }) =>
    createGetLegal(ctx.dependencies)({
      language: input.language,
      name: input.name,
    }),
  );

export const legalsRouter = createTRPCRouter({
  getLegal: getLegalProcedure,
});
