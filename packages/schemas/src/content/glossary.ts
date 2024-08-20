import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentGlossaryWords,
  contentGlossaryWordsLocalized,
} from '@blms/database';

import { resourceSchema } from './resource.js';

export const glossaryWordSchema = createSelectSchema(contentGlossaryWords, {
  relatedWords: z.array(z.string()).optional(),
});
export const glossaryWordLocalizedSchema = createSelectSchema(
  contentGlossaryWordsLocalized,
);

export const joinedGlossaryWordSchema = resourceSchema
  .pick({
    id: true,
    path: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    glossaryWordSchema.pick({
      originalWord: true,
      fileName: true,
      relatedWords: true,
      originalLanguage: true,
    }),
  )
  .merge(
    glossaryWordLocalizedSchema.pick({
      language: true,
      term: true,
      definition: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()).optional(),
    }),
  );
