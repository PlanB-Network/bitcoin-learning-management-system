import { EventType } from '@blms/constants';
import {
  contentEventLocation,
  contentEvents,
  usersEventPayment,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const eventTypeSchema = z.nativeEnum(EventType);

export const eventSchema = createSelectSchema(contentEvents);

export const joinedEventSchema = eventSchema.merge(
  z
    .object({
      languages: z.array(z.string()),
      professorName: z.string().optional(),
      tags: z.array(z.string()),
    })
    .merge(
      z.object({
        projectName: z.string().optional(),
      }),
    ),
);

export const eventPaymentSchema = createSelectSchema(usersEventPayment);

export const eventLocationSchema = createSelectSchema(contentEventLocation);
