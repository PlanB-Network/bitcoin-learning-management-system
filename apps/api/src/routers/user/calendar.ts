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
      upcomingEvents: z.boolean().optional(),
      userSpecific: z.boolean().optional(),
    }),
  )
  .output<Parser<CalendarEvent[]>>(calendarEventSchema.array())
  .query(async ({ ctx, input }) => {
    return createGetCalendarEvents(ctx.dependencies)({
      upcomingEvents: input?.upcomingEvents ?? false,
      uid: input?.userSpecific ? ctx.user.uid : undefined,
    });
  });

export const userCalendarRouter = createTRPCRouter({
  getCalendarEvents: getCalendarEventsProcedure,
});
