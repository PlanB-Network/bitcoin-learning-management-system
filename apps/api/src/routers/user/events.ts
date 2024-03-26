import { z } from 'zod';

import { eventPaymentSchema } from '@sovereign-university/schemas';
import {
  createGetEventPayments,
  createSaveEventPayment,
} from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const saveEventPaymentProcedure = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      amount: z.number(),
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

const getEventPaymentsProcedure = protectedProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output(eventPaymentSchema.array())
  .query(async ({ ctx }) =>
    createGetEventPayments(ctx.dependencies)({ uid: ctx.user.uid }),
  );

export const userEventsRouter = createTRPCRouter({
  getEventPayment: getEventPaymentsProcedure,
  saveEventPayment: saveEventPaymentProcedure,
});
