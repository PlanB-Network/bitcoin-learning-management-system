import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { contentPodcasts } from '@blms/database';

import { resourceSchema } from './resource.js';

export const podcastSchema = createSelectSchema(contentPodcasts);

export const joinedPodcastSchema = resourceSchema
  .pick({
    id: true,
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    podcastSchema.pick({
      language: true,
      name: true,
      host: true,
      description: true,
      websiteUrl: true,
      twitterUrl: true,
      podcastUrl: true,
      nostr: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
    }),
  );
