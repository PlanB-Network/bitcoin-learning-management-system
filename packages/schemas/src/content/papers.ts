import { contentResearchPapers } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { resourceSchema } from './resource.js';

export const researchPaperSchema = createSelectSchema(contentResearchPapers);

export const joinedResearchPaperSchema = resourceSchema
  .pick({
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    researchPaperSchema.pick({
      title: true,
      abstract: true,
      authors: true,
      publicationDate: true,
      source: true,
      language: true,
      topics: true,
      type: true,
      paperUrl: true,
      bibUrl: true,
    }),
  )
  .merge(
    z.object({
      id: z.string(),
      tags: z.array(z.string()),
      uuid: z.string(),
    }),
  );
