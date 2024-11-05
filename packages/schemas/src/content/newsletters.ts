import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentNewsletters,
  contentNewslettersLocalized,
} from '@blms/database';

import { resourceSchema } from './resource.js';

export const newsletterSchema = createSelectSchema(contentNewsletters);
export const newsletterLocalizedSchema = createSelectSchema(
  contentNewslettersLocalized,
);

export const joinedNewsletterSchema = resourceSchema
  .pick({
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    newsletterSchema.pick({
      author: true,
      title: true,
      language: true,
      websiteUrl: true,
      level: true,
    }),
  )
  .merge(
    z.object({
      id: z.string(),
      tags: z.array(z.string()),
      contributors: z.array(z.string()),
      publication_date: z.string().optional(),
    }),
  )
  .merge(
    newsletterLocalizedSchema.pick({
      description: true,
      newsletterId: true,
    }),
  );

export const getNewsletterResponseSchema = joinedNewsletterSchema.merge(
  z.object({ thumbnail: z.string() }),
);
