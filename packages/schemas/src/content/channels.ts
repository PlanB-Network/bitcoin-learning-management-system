import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { contentYoutubeChannels } from '@blms/database';

import { resourceSchema } from './resource.js';

export const youtubeChannelSchema = createSelectSchema(contentYoutubeChannels);

export const joinedYoutubeChannelSchema = resourceSchema
  .pick({
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    youtubeChannelSchema.pick({
      language: true,
      name: true,
      description: true,
      channel: true,
      trailer: true,
    }),
  )
  .merge(
    z.object({
      id: z.string(),
      uuid: z.string(),
      tags: z.array(z.string()),
    }),
  );
