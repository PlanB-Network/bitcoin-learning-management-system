import { z } from 'zod';

import { createUpdatePayment } from '@sovereign-university/user';

import { publicProcedure } from '../../procedures/index.js';

export const paymentWebhooksProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      isPaid: z.boolean(),
      isExpired: z.boolean(),
    }),
  )
  .mutation(({ ctx, input }) =>
    createUpdatePayment(ctx.dependencies)({
      id: input.id,
      isPaid: input.isPaid,
      isExpired: input.isExpired,
    }),
  );
