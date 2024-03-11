import { z } from 'zod';

import { createGetEvents } from '@sovereign-university/content';
import {
  courseProgressSchema,
  eventSchema,
} from '@sovereign-university/schemas';

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
  .output(courseProgressSchema.array())
  .query(async ({ ctx }) => createGetEvents(ctx.dependencies)());

export const eventsRouter = createTRPCRouter({
  getEvents: getEventsProcedure,
});
