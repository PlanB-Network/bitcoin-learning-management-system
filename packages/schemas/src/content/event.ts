import { createSelectSchema } from 'drizzle-zod';

import {
  contentEvents,
  usersEventPayment,
} from '@sovereign-university/database/schemas';

export const eventSchema = createSelectSchema(contentEvents);
export const eventPaymentSchema = createSelectSchema(usersEventPayment);
