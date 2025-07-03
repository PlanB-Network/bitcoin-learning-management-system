import { contentPodcasts } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { resourceSchema } from './resource.js';

export const podcastSchema = createSelectSchema(contentPodcasts);

export const joinedPodcastSchema = resourceSchema
  .pick({
    id: true,
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    podcastSchema.pick({
      description: true,
      host: true,
      language: true,
      name: true,
      nostr: true,
      podcastUrl: true,
      twitterUrl: true,
      websiteUrl: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
    }),
  );
