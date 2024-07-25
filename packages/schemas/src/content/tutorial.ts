import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentTutorialCredits,
  contentTutorials,
  contentTutorialsLocalized,
} from '@blms/database';

import { joinedBuilderSchema } from './builder.js';
import { joinedProfessorSchema } from './professor.js';

export const tutorialSchema = createSelectSchema(contentTutorials);
export const tutorialLocalizedSchema = createSelectSchema(
  contentTutorialsLocalized,
);
export const tutorialCreditSchema = createSelectSchema(contentTutorialCredits);

export const joinedTutorialLightSchema = tutorialSchema
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
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
      builder: joinedBuilderSchema
        .pick({
          lastCommit: true,
          path: true,
        })
        .optional()
        .nullable(),
    }),
  );

export const joinedTutorialSchema = joinedTutorialLightSchema.merge(
  tutorialLocalizedSchema.pick({
    rawContent: true,
  }),
);

export const joinedTutorialCreditSchema = tutorialCreditSchema.merge(
  z.object({
    professor: joinedProfessorSchema.optional(),
  }),
);
