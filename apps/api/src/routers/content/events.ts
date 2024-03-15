import { z } from 'zod';

import { createGetEvent, createGetEvents } from '@sovereign-university/content';
import { eventSchema } from '@sovereign-university/schemas';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getEventsProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output(eventSchema.array())
  .query(async ({ ctx }) => createGetEvents(ctx.dependencies)());

const getEventProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .output(eventSchema)
  .query(async ({ ctx, input }) => createGetEvent(ctx.dependencies)(input.id));

export const eventsRouter = createTRPCRouter({
  getEvents: getEventsProcedure,
  getEvent: getEventProcedure,
});
