import { z } from 'zod';

import { joinedLabSchema } from '@blms/schemas';
import { createGetLab } from '@blms/service-content';
import type { JoinedLab } from '@blms/types';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getLabProcedure = publicProcedure
  .input(
    z.object({
      group: z.string(),
    }),
  )
  .output<Parser<JoinedLab>>(joinedLabSchema)
  .query(({ ctx, input }) =>
    createGetLab(ctx.dependencies)({
      group: input.group,
    }),
  );

export const labsRouter = createTRPCRouter({
  getLab: getLabProcedure,
});
