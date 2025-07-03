import { contentBooks, contentBooksLocalized } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { courseLevelSchema } from './course.js';
import { resourceSchema } from './resource.js';

export const bookSchema = createSelectSchema(contentBooks);
export const bookLocalizedSchema = createSelectSchema(contentBooksLocalized);

export const joinedBookSchema = resourceSchema
  .pick({
    id: true,
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    bookSchema.pick({
      author: true,
      websiteUrl: true,
    }),
  )
  .merge(
    bookLocalizedSchema.pick({
      cover: true,
      description: true,
      downloadUrl: true,
      language: true,
      original: true,
      publicationYear: true,
      publisher: true,
      shopUrl: true,
      summaryContributorId: true,
      summaryText: true,
      title: true,
      translator: true,
    }),
  )
  .merge(
    z.object({
      level: courseLevelSchema,
      tags: z.array(z.string()),
    }),
  );
