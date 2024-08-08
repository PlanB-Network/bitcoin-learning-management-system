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

export const eventsRouter = createTRPCRouter({
  getRecentEvents: getRecentEventsProcedure,
  getEvent: getEventProcedure,
});
