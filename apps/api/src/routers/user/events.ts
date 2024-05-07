import { z } from 'zod';

import { createCalculateEventSeats } from '@sovereign-university/content';
import {
  eventPaymentSchema,
  userEventSchema,
} from '@sovereign-university/schemas';
import {
  createGetEventPayments,
  createGetUserEvents,
  createSaveEventPayment,
  createSaveUserEvent,
  generateEventTicket,
} from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const downloadEventTicketProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string().optional(),
      addressLine1: z.string().nullable(),
      addressLine2: z.string().nullable(),
      addressLine3: z.string().nullable(),
      formattedStartDate: z.string().optional(),
      formattedTime: z.string().optional(),
      liveLanguage: z.string().nullable(),
      formattedCapacity: z.string().optional(),
      contact: z.string().nullable(),
      userDisplayName: z.string(),
    }),
  )
  .output(z.string())
  .mutation(async ({ input }) => {
    return generateEventTicket(input);
  });

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

const getUserEventsProcedure = protectedProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output(userEventSchema.array())
  .query(async ({ ctx }) =>
    createGetUserEvents(ctx.dependencies)({ uid: ctx.user.uid }),
  );

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
      withPhysical: input.withPhysical,
    }),
  );

const saveUserEventProcedure = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      booked: z.boolean(),
      withPhysical: z.boolean(),
    }),
  )
  .output(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveUserEvent(ctx.dependencies)({
      uid: ctx.user.uid,
      eventId: input.eventId,
      booked: input.booked,
      withPhysical: input.withPhysical,
    });

    await createCalculateEventSeats(ctx.dependencies)();
    const { redis } = ctx.dependencies;
    await redis.del('trpc:content.getEvent*');
  });

export const userEventsRouter = createTRPCRouter({
  downloadEventTicket: downloadEventTicketProcedure,
  getEventPayment: getEventPaymentsProcedure,
  getUserEvents: getUserEventsProcedure,
  saveEventPayment: saveEventPaymentProcedure,
  saveUserEvent: saveUserEventProcedure,
});
