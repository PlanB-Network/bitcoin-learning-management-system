import { z } from 'zod';

import { calendarEventSchema } from '@blms/schemas';
import { createGetCalendarEvents } from '@blms/service-user';
import type { CalendarEvent } from '@blms/types';

import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getCalendarEventsProcedure = studentProcedure
  .input(
    z.object({
      language: z.string(),
    }),
  )
  .output<Parser<CalendarEvent[]>>(calendarEventSchema.array())
  .query(({ ctx, input }) =>
    createGetCalendarEvents(ctx.dependencies)({
      uid: ctx.user.uid,
      language: input.language,
    }),
  );

export const userCalendarRouter = createTRPCRouter({
  getCalendarEvents: getCalendarEventsProcedure,
});
