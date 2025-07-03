import { contentLegals, contentLegalsLocalized } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const legalSchema = createSelectSchema(contentLegals);
export const legalLocalizedSchema = createSelectSchema(contentLegalsLocalized);

export const joinedLegalLightSchema = legalSchema
  .pick({
    id: true,
    lastCommit: true,
    lastSync: true,
    lastUpdated: true,
    name: true,
    path: true,
  })
  .merge(
    legalLocalizedSchema.pick({
      language: true,
      title: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()).optional(),
    }),
  );

export const joinedLegalSchema = joinedLegalLightSchema.merge(
  legalLocalizedSchema.pick({
    rawContent: true,
  }),
);
