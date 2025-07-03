import { contentNewsletters } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { resourceSchema } from './resource.js';

export const newsletterSchema = createSelectSchema(contentNewsletters);

export const joinedNewsletterSchema = resourceSchema
  .pick({
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    newsletterSchema.pick({
      author: true,
      description: true,
      language: true,
      level: true,
      title: true,
      websiteUrl: true,
    }),
  )
  .merge(
    z.object({
      projectName: z.string().optional(),
    }),
  )
  .merge(
    z.object({
      contributors: z.array(z.string()),
      id: z.string(),
      publication_date: z.string().optional(),
      tags: z.array(z.string()),
      uuid: z.string(),
    }),
  );
