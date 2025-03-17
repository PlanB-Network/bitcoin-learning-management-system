import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentTutorialLikesDislikes,
  contentTutorials,
  contentTutorialsLocalized,
} from '@blms/database';
import { formattedProfessorSchema } from './professor.js';

export const tutorialSchema = createSelectSchema(contentTutorials);
export const tutorialLocalizedSchema = createSelectSchema(
  contentTutorialsLocalized,
);

export const tutorialLikeDislikeSchema = createSelectSchema(
  contentTutorialLikesDislikes,
);

export const joinedTutorialLightSchema = tutorialSchema
  .pick({
    id: true,
    path: true,
    logoUrl: true,
    name: true,
    level: true,
    category: true,
    subcategory: true,
    projectId: true,
    professorId: true,
    creditLink: true,
    originalLanguage: true,
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
      likeCount: z.number(),
      dislikeCount: z.number(),
      tags: z.array(z.string()),
    }),
  );

export const joinedTutorialSchema = joinedTutorialLightSchema.merge(
  tutorialLocalizedSchema.pick({
    rawContent: true,
  }),
);

export const tutorialWithProfessorNameSchema = tutorialSchema
  .pick({
    id: true,
    path: true,
    logoUrl: true,
    name: true,
    category: true,
    subcategory: true,
  })
  .merge(
    tutorialLocalizedSchema.pick({
      language: true,
      title: true,
    }),
  )
  .merge(
    z.object({
      likeCount: z.number(),
      dislikeCount: z.number(),
      professorName: z.string().nullable(),
      professorId: z.string().nullable(),
    }),
  );

export const getTutorialResponseSchema = joinedTutorialSchema.merge(
  z.object({
    professor: formattedProfessorSchema.optional(),
  }),
);
