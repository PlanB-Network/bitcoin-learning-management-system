import { z } from 'zod';

import {
  checkoutDataSchema,
  eventPaymentSchema,
  userEventSchema,
} from '@blms/schemas';
import {
  createCalculateEventSeats,
  createGetEvent,
} from '@blms/service-content';
import {
  createGetEventPayments,
  createGetParticipantsForEvent,
  createGetUserEvents,
  createSaveEventPayment,
  createSaveUserEvent,
  generateEventTicket,
} from '@blms/service-user';
import type {
  CalendarEventParticipant,
  CheckoutData,
  EventPayment,
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
      satsPrice: z.number(),
      dollarPrice: z.number(),
      couponCode: z.string().optional(),
      withPhysical: z.boolean(),
      method: z.string(),
    }),
  )
  .output<Parser<CheckoutData>>(checkoutDataSchema)
  .mutation(({ ctx, input }) =>
    createSaveEventPayment(ctx.dependencies)({
      uid: ctx.user.uid,
      eventId: input.eventId,
      satsPrice: input.satsPrice,
      dollarPrice: input.dollarPrice,
      method: input.method,
      couponCode: input.couponCode,
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

const getParticipantsForEventProcedure = adminProcedure
  .output<Parser<CalendarEventParticipant[]>>(
    z.array(
      z.object({
        uid: z.string(),
        username: z.string(),
        displayName: z.string(),
        email: z.string(),
        id: z.string(),
      }),
    ),
  )
  .query(({ ctx }) => {
    return createGetParticipantsForEvent(ctx.dependencies)();
  });

export const userEventsRouter = createTRPCRouter({
  downloadEventTicket: downloadEventTicketProcedure,
  getEventPayment: getEventPaymentsProcedure,
  getUserEvents: getUserEventsProcedure,
  saveEventPayment: saveEventPaymentProcedure,
  saveUserEvent: saveUserEventProcedure,
  getParticipantsForEvent: getParticipantsForEventProcedure,
});
