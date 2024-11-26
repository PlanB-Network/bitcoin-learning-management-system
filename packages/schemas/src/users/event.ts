import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { usersUserEvent } from '@blms/database';

export const userEventSchema = createSelectSchema(usersUserEvent);

export const extendedUserEventSchema = userEventSchema.merge(
  z.object({
    username: z.string(),
    displayName: z.string(),
  }),
);

export const calendarEventParticipantSchema = z.object({
  uid: z.string(),
  username: z.string(),
  displayName: z.string(),
  email: z.string(),
  id: z.string(),
});
