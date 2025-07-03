import { z } from 'zod';

export const calendarEventSchema = z.object({
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  addressLine3: z.string().nullable(),
  endDate: z.date().nullable(),
  id: z.string(),
  isInPerson: z.boolean(),
  isOnline: z.boolean(),
  name: z.string(),
  organizer: z.string().nullable(),
  startDate: z.date(),
  subId: z.string().nullable(),
  timezone: z.string().nullable(),
  type: z.string(),
});
