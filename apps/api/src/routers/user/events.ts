import { UserPermission } from '@blms/constants';

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
import { LANGUAGES_MAP } from '@blms/shared';
import type {
  CalendarEventParticipant,
  CheckoutData,
  EventPayment,
  UserEvent,
} from '@blms/types';
import { z } from 'zod';
import { checkPermissions } from '#src/middlewares/auth.js';
import { adminProcedure, studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';
import { formatDate, formatTime } from '#src/utils/date.js';

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
        ? `${formatTime(event.startDate, timezone)} to ${formatTime(
            event.endDate,
            timezone,
          )}`
        : '';

    return generateEventTicket({
      addressLine1: event.addressLine1 ?? '',
      addressLine2: event.addressLine2,
      addressLine3: event.addressLine3,
      availableSeats: event.availableSeats,
      formattedStartDate: formattedStartDate,
      formattedTime: formattedTime,
      liveLanguage: event.languages
        .map((code) => LANGUAGES_MAP[code])
        .join(', '),
      organizer: event.projectName,
      title: event.name ? event.name : '',
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
      couponCode: z.string().optional(),
      dollarPrice: z.number(),
      eventId: z.string(),
      method: z.string(),
      satsPrice: z.number(),
      withPhysical: z.boolean(),
    }),
  )
  .output<Parser<CheckoutData>>(checkoutDataSchema)
  .mutation(({ ctx, input }) =>
    createSaveEventPayment(ctx.dependencies)({
      couponCode: input.couponCode,
      dollarPrice: input.dollarPrice,
      eventId: input.eventId,
      method: input.method,
      satsPrice: input.satsPrice,
      uid: ctx.user.uid,
      withPhysical: input.withPhysical,
    }),
  );

const saveUserEventProcedure = studentProcedure
  .input(
    z.object({
      booked: z.boolean(),
      eventId: z.string(),
      withPhysical: z.boolean(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createSaveUserEvent(ctx.dependencies)({
      booked: input.booked,
      eventId: input.eventId,
      uid: ctx.user.uid,
      withPhysical: input.withPhysical,
    });

    await createCalculateEventSeats(ctx.dependencies)();
  });

const getParticipantsForEventProcedure = adminProcedure
  .use(checkPermissions(UserPermission.Bookings))
  .output<Parser<CalendarEventParticipant[]>>(
    z.array(
      z.object({
        displayName: z.string(),
        email: z.string(),
        id: z.string(),
        uid: z.string(),
        username: z.string(),
      }),
    ),
  )
  .query(({ ctx }) => {
    return createGetParticipantsForEvent(ctx.dependencies)();
  });

export const userEventsRouter = createTRPCRouter({
  downloadEventTicket: downloadEventTicketProcedure,
  getEventPayment: getEventPaymentsProcedure,
  getParticipantsForEvent: getParticipantsForEventProcedure,
  getUserEvents: getUserEventsProcedure,
  saveEventPayment: saveEventPaymentProcedure,
  saveUserEvent: saveUserEventProcedure,
});
