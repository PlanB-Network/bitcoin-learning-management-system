import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentBet,
  contentBetLocalized,
  contentBetViewUrl,
} from '@sovereign-university/database/schemas';

import { resourceSchema } from './resource.js';

export const betSchema = createSelectSchema(contentBet);
export const betViewUrlSchema = createSelectSchema(contentBetViewUrl);
export const betLocalizedSchema = createSelectSchema(contentBetLocalized);

export const joinedBetSchema = resourceSchema
  .pick({
    id: true,
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    betSchema.pick({
      type: true,
      downloadUrl: true,
      viewUrl: true,
      builder: true,
    }),
  )
  .merge(
    betLocalizedSchema.pick({
      language: true,
      name: true,
      description: true,
      viewUrl: true,
    }),
  )
  .merge(
    z.object({
      viewUrls: betViewUrlSchema.array(),
      tags: z.array(z.string()),
    }),
  );
