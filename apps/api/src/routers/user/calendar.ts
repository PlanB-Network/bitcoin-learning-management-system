import { z } from 'zod';

import { calendarEventSchema } from '@blms/schemas';
import { createGetCalendarEvents } from '@blms/service-user';
import type { CalendarEvent } from '@blms/types';

import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const calendarInputSchema = z.object({
  language: z.string(),
  upcomingEvents: z.boolean().optional(),
});
const getCalendarEventsProcedure = studentProcedure
  .input(calendarInputSchema)
  .output<Parser<CalendarEvent[]>>(calendarEventSchema.array())
  .query(async ({ ctx, input }) => {
    const allEvents = await createGetCalendarEvents(ctx.dependencies)({
      uid: ctx.user.uid,
      language: input.language,
    });

    if (input.upcomingEvents) {
      const now = new Date();
      return allEvents.filter(
        (event) => event.startDate && new Date(event.startDate) > now,
      );
    }
    return allEvents;
  });

export const userCalendarRouter = createTRPCRouter({
  getCalendarEvents: getCalendarEventsProcedure,
});
