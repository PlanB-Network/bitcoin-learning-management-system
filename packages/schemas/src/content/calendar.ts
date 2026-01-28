import { contentCalendar, contentCalendarLocalized } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
export const calendarSchema = createSelectSchema(contentCalendar);
export const calendarLocalizedSchema = createSelectSchema(
  contentCalendarLocalized,
);

export const joinedCalendarSchema = calendarSchema
  .pick({
    resourceId: true,
    date: true,
    originalLanguage: true,
  })
  .merge(
    calendarLocalizedSchema.pick({
      language: true,
      title: true,
    }),
  );
