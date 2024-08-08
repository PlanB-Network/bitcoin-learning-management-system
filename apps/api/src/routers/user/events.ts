import { z } from 'zod';

import { eventPaymentSchema, userEventSchema } from '@blms/schemas';
import {
  createCalculateEventSeats,
  createGetEvent,
} from '@blms/service-content';
import {
  createGetEventPayments,
  createGetUserEvents,
  createSaveEventPayment,
  createSaveUserEvent,
  generateEventTicket,
} from '@blms/service-user';

import { studentProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';
import { formatDate, formatTime } from '../../utils/date.js';

const downloadEventTicketProcedure = studentProcedure
  .input(
    z.object({
      eventId: z.string(),
      userDisplayName: z.string(),
    }),
  )
  .output(z.string())
  .mutation(async ({ ctx, input }) => {
    const event = await createGetEvent(ctx.dependencies)(input.eventId);

    const timezone = event.timezone ? event.timezone : undefined;

    const formattedStartDate = event.startDate
      ? formatDate(event.startDate)
      : '';
    const formattedTime =
      event.startDate && event.endDate
        ? `${formatTime(event.startDate, timezone)} to ${formatTime(event.endDate, timezone)}`
        : '';
    const formattedCapacity = event.availableSeats
      ? `limited to ${event.availableSeats} people`
      : '';

    return generateEventTicket({
      title: event.name ? event.name : '',
      addressLine1: event.addressLine1,
      addressLine2: event.addressLine2,
      addressLine3: event.addressLine3,
      formattedStartDate: formattedStartDate,
      formattedTime: formattedTime,
      liveLanguage: '',
      formattedCapacity: formattedCapacity,
      contact: '',
      userDisplayName: input.userDisplayName,
    });
  });

const getEventPaymentsProcedure = studentProcedure
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

const getUserEventsProcedure = studentProcedure
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

const saveEventPaymentProcedure = studentProcedure
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

const saveUserEventProcedure = studentProcedure
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
  });

export const userEventsRouter = createTRPCRouter({
  downloadEventTicket: downloadEventTicketProcedure,
  getEventPayment: getEventPaymentsProcedure,
  getUserEvents: getUserEventsProcedure,
  saveEventPayment: saveEventPaymentProcedure,
  saveUserEvent: saveUserEventProcedure,
});
