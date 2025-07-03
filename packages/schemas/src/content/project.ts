import {
  contentProjectLocation,
  contentProjects,
  contentProjectsLocalized,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { resourceSchema } from './resource.js';

export const projectLocationSchema = createSelectSchema(contentProjectLocation);

export const projectSchema = createSelectSchema(contentProjects, {
  languages: z.array(z.string()),
});

export const projectLocalizedSchema = createSelectSchema(
  contentProjectsLocalized,
);

export const joinedProjectSchema = resourceSchema
  .pick({
    id: true,
    lastCommit: true,
    path: true,
  })
  .merge(
    projectSchema.pick({
      addressLine1: true,
      addressLine2: true,
      addressLine3: true,
      category: true,
      githubUrl: true,
      languages: true,
      name: true,
      nostr: true,
      originalLanguage: true,
      twitterUrl: true,
      websiteUrl: true,
    }),
  )
  .merge(
    projectLocalizedSchema.pick({
      description: true,
      language: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()).optional(),
    }),
  );
