import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  betTypeEnum,
  contentBet,
  contentBetLocalized,
  contentBetViewUrl,
} from '@blms/database';

import { resourceSchema } from './resource.js';

export const betTypeSchema = z.enum(betTypeEnum.enumValues);

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
      originalLanguage: true,
      builder: true,
    }),
  )
  .merge(
    betLocalizedSchema.pick({
      language: true,
      name: true,
      description: true,
    }),
  )
  .merge(
    z.object({
      viewurls: betViewUrlSchema.array(),
      tags: z.array(z.string()),
    }),
  );
