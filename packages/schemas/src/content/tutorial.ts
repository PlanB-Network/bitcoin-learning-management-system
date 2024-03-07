import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentTutorialCredits,
  contentTutorials,
  contentTutorialsLocalized,
} from '@sovereign-university/database/schemas';

import { joinedProfessorSchema } from './professor.js';

export const tutorialSchema = createSelectSchema(contentTutorials);
export const tutorialLocalizedSchema = createSelectSchema(
  contentTutorialsLocalized,
);
export const tutorialCreditSchema = createSelectSchema(contentTutorialCredits);

export const joinedTutorialSchema = tutorialSchema
  .pick({
    id: true,
    path: true,
    name: true,
    level: true,
    category: true,
    subcategory: true,
    lastUpdated: true,
    lastCommit: true,
  })
  .merge(
    tutorialLocalizedSchema.pick({
      language: true,
      title: true,
      description: true,
      rawContent: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
      // Todo fix validation
      //builder: joinedBuilderSchema.omit({ tags: true }).optional(),
    }),
  );

export const joinedTutorialCreditSchema = tutorialCreditSchema.merge(
  z.object({
    professor: joinedProfessorSchema.optional(),
  }),
);
