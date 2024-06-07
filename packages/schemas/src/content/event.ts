import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentEvents,
  usersEventPayment,
  contentEventLocation,
} from '@sovereign-university/database/schemas';

export const eventSchema = createSelectSchema(contentEvents);
export const joinedEventSchema = eventSchema.merge(
  z.object({
    tags: z.array(z.string()),
    languages: z.array(z.string()),
    picture: z.string().optional(),
  }),
);

export const eventPaymentSchema = createSelectSchema(usersEventPayment);

export const eventLocationSchema = createSelectSchema(contentEventLocation);
