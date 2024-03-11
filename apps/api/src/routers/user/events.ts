import { z } from 'zod';

import { createSaveEventPayment } from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const saveEventPaymentProcedure = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      amount: z.number(),
      withPhysical: z.boolean(),
    }),
  )
  .output(
    z.object({
      id: z.string(),
      pr: z.string(),
      onChainAddr: z.string(),
      amount: z.number(),
      checkoutUrl: z.string(),
    }),
  )
  .mutation(({ ctx, input }) =>
    createSaveEventPayment(ctx.dependencies)({
      uid: ctx.user.uid,
      eventId: input.eventId,
      amount: input.amount,
    }),
  );

export const userEventsRouter = createTRPCRouter({
  saveEventPayment: saveEventPaymentProcedure,
});
