import { usersUserEvent } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const userEventSchema = createSelectSchema(usersUserEvent);

export const extendedUserEventSchema = userEventSchema.merge(
  z.object({
    displayName: z.string(),
    username: z.string(),
  }),
);

export const calendarEventParticipantSchema = z.object({
  displayName: z.string(),
  email: z.string(),
  id: z.string(),
  uid: z.string(),
  username: z.string(),
});
