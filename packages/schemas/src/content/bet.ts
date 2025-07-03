import { BetType } from '@blms/constants';
import {
  contentBet,
  contentBetLocalized,
  contentBetViewUrl,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { resourceSchema } from './resource.js';

export const betTypeSchema = z.nativeEnum(BetType);

export const betSchema = createSelectSchema(contentBet);
export const betViewUrlSchema = createSelectSchema(contentBetViewUrl);
export const betLocalizedSchema = createSelectSchema(contentBetLocalized);

export const joinedBetSchema = resourceSchema
  .pick({
    id: true,
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    betSchema.pick({
      downloadUrl: true,
      originalLanguage: true,
      type: true,
    }),
  )
  .merge(
    z.object({
      projectName: z.string().optional(),
    }),
  )
  .merge(
    betLocalizedSchema.pick({
      description: true,
      language: true,
      name: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
      viewurls: betViewUrlSchema.array(),
    }),
  );
