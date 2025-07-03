import {
  contentGlossaryWords,
  contentGlossaryWordsLocalized,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { resourceSchema } from './resource.js';

export const glossaryWordSchema = createSelectSchema(contentGlossaryWords, {
  relatedWords: z.array(z.string()).optional().nullable(),
});
export const glossaryWordLocalizedSchema = createSelectSchema(
  contentGlossaryWordsLocalized,
);

export const joinedGlossaryWordSchema = resourceSchema
  .pick({
    id: true,
    lastCommit: true,
    lastUpdated: true,
    path: true,
  })
  .merge(
    glossaryWordSchema.pick({
      fileName: true,
      originalLanguage: true,
      originalWord: true,
      relatedWords: true,
    }),
  )
  .merge(
    glossaryWordLocalizedSchema.pick({
      definition: true,
      language: true,
      term: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()).optional(),
    }),
  );
