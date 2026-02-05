import { calendarEventSchema } from '@blms/schemas';
import { createGetCalendarEvents } from '@blms/service-user';
import type { CalendarEvent } from '@blms/types';
import { z } from 'zod';

import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getCalendarEventsProcedure = studentProcedure
  .input(
    z.object({
      upcomingEvents: z.boolean().optional(),
      userSpecific: z.boolean().optional(),
      language: z.string().optional(),
      courseId: z.string().optional(),
    }),
  )
  .output<Parser<CalendarEvent[]>>(calendarEventSchema.array())
  .query(async ({ ctx, input }) => {
    return createGetCalendarEvents(ctx.dependencies)({
      uid: input?.userSpecific ? ctx.user.uid : undefined,
      upcomingEvents: input?.upcomingEvents ?? false,
      language: input?.language,
      courseId: input?.courseId,
    });
  });

export const userCalendarRouter = createTRPCRouter({
  getCalendarEvents: getCalendarEventsProcedure,
});
