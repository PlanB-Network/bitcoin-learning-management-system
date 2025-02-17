import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { joinedEventSchema } from '@blms/schemas';
import {
  createCheckEventAccess,
  createGetEvent,
  createGetRecentEvents,
  createGetUpcomingEvent,
  createGetUpcomingEventsBooking,
} from '@blms/service-content';
import type { JoinedEvent } from '@blms/types';

import { adminProcedure } from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getUpcomingEventsBookingsProcedure = adminProcedure
  .input(z.object({ language: z.string().optional() }).optional())
  .output<Parser<JoinedEvent[]>>(joinedEventSchema.array())
  .query(({ ctx }) => createGetUpcomingEventsBooking(ctx.dependencies)());

const getRecentEventsProcedure = publicProcedure
  .input(z.object({ language: z.string().optional() }).optional())
  .output<Parser<JoinedEvent[]>>(joinedEventSchema.array())
  .query(({ ctx }) => createGetRecentEvents(ctx.dependencies)());

const getEventProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .output<Parser<JoinedEvent>>(joinedEventSchema)
  .query(async ({ ctx, input }) => {
    const uid = ctx.user?.uid || null;

    const status = await createCheckEventAccess(ctx.dependencies)(
      input.id,
      uid,
    );

    if (!status.allowed) {
      throw new TRPCError({
        code: uid ? 'FORBIDDEN' : 'UNAUTHORIZED',
        cause: 'Payment required to access this chapter',
      });
    }

    return createGetEvent(ctx.dependencies)(input.id);
  });

const getUpcomingEventProcedure = publicProcedure
  .output<Parser<JoinedEvent | null>>(joinedEventSchema.nullable())
  .query(({ ctx }) => createGetUpcomingEvent(ctx.dependencies)());

export const eventsRouter = createTRPCRouter({
  getUpcomingEventsBookings: getUpcomingEventsBookingsProcedure,
  getRecentEvents: getRecentEventsProcedure,
  getEvent: getEventProcedure,
  getUpcomingEvent: getUpcomingEventProcedure,
});
