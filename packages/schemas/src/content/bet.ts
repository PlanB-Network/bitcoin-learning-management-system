import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentBet,
  contentBetLocalized,
  contentBetViewUrl,
} from '@blms/database';

import { resourceSchema } from './resource.js';

import { BetType } from '@blms/constants';

export const betTypeSchema = z.nativeEnum(BetType);

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
    }),
  )
  .merge(
    z.object({
      projectName: z.string().optional(),
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
