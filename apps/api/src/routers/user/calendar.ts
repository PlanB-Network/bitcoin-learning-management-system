/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-unresolved */

import { z } from 'zod';

import { calendarEventSchema } from '@sovereign-university/schemas';
import { createGetCalendarEvents } from '@sovereign-university/user';

import { protectedProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';

const getCalendarEventsProcedure = protectedProcedure
  .input(
    z.object({
      language: z.string(),
    }),
  )
  .output(calendarEventSchema.array())
  .query(({ ctx, input }) =>
    createGetCalendarEvents(ctx.dependencies)({
      uid: ctx.user.uid,
      language: input.language,
    }),
  );

export const userCalendarRouter = createTRPCRouter({
  getCalendarEvents: getCalendarEventsProcedure,
});
