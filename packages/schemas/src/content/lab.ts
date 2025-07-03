import { contentLabSession, contentLabs } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const labSchema = createSelectSchema(contentLabs);
export const labSessionSchema = createSelectSchema(contentLabSession);

export const joinedLabSchema = z.object({
  lab: labSchema.nullable(),
  sessions: labSessionSchema.array(),
});
