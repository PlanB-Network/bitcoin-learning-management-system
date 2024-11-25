import { z } from 'zod';

import {
  checkoutDataSchema,
  eventPaymentSchema,
  extendedUserEventSchema,
  userEventSchema,
} from '@blms/schemas';
import {
  createCalculateEventSeats,
  createGetEvent,
} from '@blms/service-content';
import {
  createGetEventPayments,
  createGetParticipantsForEvents,
  createGetUserEvents,
  createSaveEventPayment,
  createSaveUserEvent,
  generateEventTicket,
} from '@blms/service-user';
import type {
  CheckoutData,
  EventPayment,
  ExtendedUserEvent,
  UserEvent,
} from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { adminProcedure, studentProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';
import { formatDate, formatTime } from '../../utils/date.js';

const downloadEventTicketProcedure = studentProcedure
  .input(
    z.object({
      eventId: z.string(),
      userName: z.string(),
    }),
  )
  .output<Parser<string>>(z.string())
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
      addressLine1: event.addressLine1 ?? '',
      addressLine2: event.addressLine2,
      addressLine3: event.addressLine3,
      formattedStartDate: formattedStartDate,
      formattedTime: formattedTime,
      liveLanguage: '',
      formattedCapacity: formattedCapacity,
      contact: '',
      userName: input.userName,
    }).then((buffer) => buffer.toString('base64'));
  });

const getEventPaymentsProcedure = studentProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output<Parser<EventPayment[]>>(eventPaymentSchema.array())
  .query(({ ctx }) => {
    return createGetEventPayments(ctx.dependencies)({ uid: ctx.user.uid });
  });

const getUserEventsProcedure = studentProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output<Parser<UserEvent[]>>(userEventSchema.array())
  .query(({ ctx }) =>
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
  .output<Parser<CheckoutData>>(checkoutDataSchema)
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
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveUserEvent(ctx.dependencies)({
      uid: ctx.user.uid,
      eventId: input.eventId,
      booked: input.booked,
      withPhysical: input.withPhysical,
    });

    await createCalculateEventSeats(ctx.dependencies)();
  });

const getParticipantsForEventsProcedure = adminProcedure
  .input(
    z.object({
      eventIds: z.array(z.string()),
    }),
  )
  .output<Parser<ExtendedUserEvent[]>>(z.array(extendedUserEventSchema))
  .query(({ ctx, input }) => {
    return createGetParticipantsForEvents(ctx.dependencies)({
      eventIds: input.eventIds,
    });
  });

export const userEventsRouter = createTRPCRouter({
  downloadEventTicket: downloadEventTicketProcedure,
  getEventPayment: getEventPaymentsProcedure,
  getUserEvents: getUserEventsProcedure,
  saveEventPayment: saveEventPaymentProcedure,
  saveUserEvent: saveUserEventProcedure,
  getParticipantsForEvents: getParticipantsForEventsProcedure,
});
