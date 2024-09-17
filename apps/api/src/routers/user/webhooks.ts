import { z } from 'zod';

import { createUpdatePayment } from '@blms/service-user';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';

export const paymentWebhooksProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      isPaid: z.boolean(),
      isExpired: z.boolean(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createUpdatePayment(ctx.dependencies)({
      id: input.id,
      isPaid: input.isPaid,
      isExpired: input.isExpired,
    }),
  );
