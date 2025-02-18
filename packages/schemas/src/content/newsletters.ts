import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { contentNewsletters } from '@blms/database';

import { resourceSchema } from './resource.js';

export const newsletterSchema = createSelectSchema(contentNewsletters);

export const joinedNewsletterSchema = resourceSchema
  .pick({
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    newsletterSchema.pick({
      author: true,
      websiteUrl: true,
      level: true,
      language: true,
      description: true,
      title: true,
    }),
  )
  .merge(
    z.object({
      uuid: z.string(),
      id: z.string(),
      tags: z.array(z.string()),
      contributors: z.array(z.string()),
      publication_date: z.string().optional(),
    }),
  );
