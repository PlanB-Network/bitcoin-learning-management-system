import { createGetUpcomingEvent } from 'node_modules/@blms/service-content/src/lib/events/services/get-events.js';
import { z } from 'zod';

import { joinedEventSchema } from '@blms/schemas';
import { createGetEvent, createGetRecentEvents } from '@blms/service-content';
import type { JoinedEvent } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getRecentEventsProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output<Parser<JoinedEvent[]>>(joinedEventSchema.array())
  .query(({ ctx }) => createGetRecentEvents(ctx.dependencies)());

const getEventProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .output<Parser<JoinedEvent>>(joinedEventSchema)
  .query(({ ctx, input }) => createGetEvent(ctx.dependencies)(input.id));

const getUpcomingEventProcedure = publicProcedure
  .output<Parser<JoinedEvent | null>>(joinedEventSchema.nullable())
  .query(({ ctx }) => {
    return createGetUpcomingEvent(ctx.dependencies)();
  });

export const eventsRouter = createTRPCRouter({
  getRecentEvents: getRecentEventsProcedure,
  getEvent: getEventProcedure,
  getUpcomingEvent: getUpcomingEventProcedure,
});
