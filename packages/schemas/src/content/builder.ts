import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentBuilders,
  contentBuildersLocalized,
} from '@sovereign-university/database/schemas';

import { resourceSchema } from './resource.js';

export const builderSchema = createSelectSchema(contentBuilders);
export const builderLocalizedSchema = createSelectSchema(
  contentBuildersLocalized,
);

export const joinedBuilderSchema = resourceSchema
  .pick({
    id: true,
    path: true,
    // Todo fix validation
    // lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    builderSchema.pick({
      name: true,
      category: true,
      websiteUrl: true,
      twitterUrl: true,
      githubUrl: true,
      nostr: true,
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
