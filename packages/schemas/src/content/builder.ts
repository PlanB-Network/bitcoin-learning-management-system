import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentBuilderLocation,
  contentBuilders,
  contentBuildersLocalized,
} from '@blms/database';

import { resourceSchema } from './resource.js';

export const builderLocationSchema = createSelectSchema(contentBuilderLocation);

export const builderSchema = createSelectSchema(contentBuilders, {
  languages: z.array(z.string()),
});

export const builderLocalizedSchema = createSelectSchema(
  contentBuildersLocalized,
);

export const joinedBuilderSchema = resourceSchema
  .pick({
    id: true,
    path: true,
    lastCommit: true,
  })
  .merge(
    builderSchema.pick({
      name: true,
      category: true,
      languages: true,
      websiteUrl: true,
      twitterUrl: true,
      githubUrl: true,
      nostr: true,
      addressLine1: true,
      addressLine2: true,
      addressLine3: true,
      originalLanguage: true,
    }),
  )
  .merge(
    builderLocalizedSchema.pick({
      language: true,
      description: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()).optional(),
    }),
  );
