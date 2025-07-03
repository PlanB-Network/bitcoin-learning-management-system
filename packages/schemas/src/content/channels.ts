import { contentYoutubeChannels } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { resourceSchema } from './resource.js';

export const youtubeChannelSchema = createSelectSchema(contentYoutubeChannels);

export const joinedYoutubeChannelSchema = resourceSchema
  .pick({
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    youtubeChannelSchema.pick({
      channel: true,
      description: true,
      language: true,
      name: true,
      trailer: true,
    }),
  )
  .merge(
    z.object({
      projectName: z.string().optional(),
    }),
  )
  .merge(
    z.object({
      id: z.string(),
      tags: z.array(z.string()),
      uuid: z.string(),
    }),
  );
