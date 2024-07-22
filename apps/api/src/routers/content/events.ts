import { z } from 'zod';

import {
  createGetEvent,
  createGetRecentEvents,
} from '@sovereign-university/content';
import { joinedEventSchema } from '@sovereign-university/schemas';
import type { JoinedEvent } from '@sovereign-university/types';

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

export const eventsRouter = createTRPCRouter({
  getRecentEvents: getRecentEventsProcedure,
  getEvent: getEventProcedure,
});
