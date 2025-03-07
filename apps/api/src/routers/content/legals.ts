import { z } from 'zod';

import { joinedLegalSchema } from '@blms/schemas';
import { createGetLegal } from '@blms/service-content';
import type { JoinedLegal } from '@blms/types';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getLegalProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<JoinedLegal>>(joinedLegalSchema)
  .query(({ ctx, input }) =>
    createGetLegal(ctx.dependencies)({
      name: input.name,
      language: input.language,
    }),
  );

export const legalsRouter = createTRPCRouter({
  getLegal: getLegalProcedure,
});
