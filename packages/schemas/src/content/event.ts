import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentEventLocation,
  contentEvents,
  usersEventPayment,
} from '@blms/database';

import { EventType } from '@blms/constants';

export const eventTypeSchema = z.nativeEnum(EventType);

export const eventSchema = createSelectSchema(contentEvents);

export const joinedEventSchema = eventSchema.merge(
  z
    .object({
      tags: z.array(z.string()),
      languages: z.array(z.string()),
      professorName: z.string().optional(),
    })
    .merge(
      z.object({
        projectName: z.string().optional(),
      }),
    ),
);

export const eventPaymentSchema = createSelectSchema(usersEventPayment);

export const eventLocationSchema = createSelectSchema(contentEventLocation);
