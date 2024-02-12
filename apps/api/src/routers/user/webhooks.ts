import { z } from 'zod';

import { createUpdatePayment } from '@sovereign-university/user';

import { publicProcedure } from '../../procedures/index.js';

export const paymentWebhooksProcedure = publicProcedure
  .meta({
    openapi: { method: 'POST', path: '/users/courses/payment/webhooks' },
  })
  .input(
    z.object({
      id: z.string(),
      isPaid: z.boolean(),
      isExpired: z.boolean(),
    }),
  )
  .output(z.any())
  .mutation(({ ctx, input }) =>
    createUpdatePayment(ctx.dependencies)({
      id: input.id,
      isPaid: input.isPaid,
      isExpired: input.isExpired,
    }),
  );
