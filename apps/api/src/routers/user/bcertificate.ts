// import { z } from 'zod';

// import { calendarEventSchema } from '@sovereign-university/schemas';
// import type { CalendarEvent } from '@sovereign-university/types';
// import { createGetCalendarEvents } from '@sovereign-university/user';

// import { protectedProcedure } from '#src/procedures/protected.js';
// import { createTRPCRouter } from '#src/trpc/index.js';
// import type { Parser } from '#src/trpc/types.js';

// const getCalendarEventsProcedure = protectedProcedure
//   .input(
//     z.object({
//       language: z.string(),
//     }),
//   )
//   .output<Parser<CalendarEvent[]>>(calendarEventSchema.array())
//   .query(({ ctx, input }) =>
//     createGetCalendarEvents(ctx.dependencies)({
//       uid: ctx.user.uid,
//       language: input.language,
//     }),
//   );

// export const userCalendarRouter = createTRPCRouter({
//   getCalendarEvents: getCalendarEventsProcedure,
// });
