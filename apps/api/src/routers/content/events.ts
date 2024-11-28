import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { joinedEventSchema } from '@blms/schemas';
import {
  createCheckEventAccess,
  createGetEvent,
  createGetRecentEvents,
  createGetUpcomingEvent,
} from '@blms/service-content';
import type { JoinedEvent } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

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
  getRecentEvents: getRecentEventsProcedure,
  getEvent: getEventProcedure,
  getUpcomingEvent: getUpcomingEventProcedure,
});
