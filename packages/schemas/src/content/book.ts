import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { contentBooks, contentBooksLocalized } from '@blms/database';

import { resourceSchema } from './resource.js';

import { levelSchema } from './index.js';

export const bookSchema = createSelectSchema(contentBooks);
export const bookLocalizedSchema = createSelectSchema(contentBooksLocalized);

export const joinedBookSchema = resourceSchema
  .pick({
    id: true,
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    bookSchema.pick({
      author: true,
      websiteUrl: true,
    }),
  )
  .merge(
    bookLocalizedSchema.pick({
      language: true,
      title: true,
      translator: true,
      description: true,
      publisher: true,
      publicationYear: true,
      cover: true,
      summaryText: true,
      summaryContributorId: true,
      shopUrl: true,
      downloadUrl: true,
      original: true,
    }),
  )
  .merge(
    z.object({
      level: levelSchema,
      tags: z.array(z.string()),
    }),
  );
