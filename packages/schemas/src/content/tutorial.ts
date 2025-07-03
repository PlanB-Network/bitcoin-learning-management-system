import {
  contentTutorialLikesDislikes,
  contentTutorials,
  contentTutorialsLocalized,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
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
    category: true,
    creditLink: true,
    id: true,
    lastCommit: true,
    lastUpdated: true,
    level: true,
    logoUrl: true,
    name: true,
    originalLanguage: true,
    path: true,
    professorId: true,
    projectId: true,
    subcategory: true,
  })
  .merge(
    tutorialLocalizedSchema.pick({
      description: true,
      language: true,
      title: true,
    }),
  )
  .merge(
    z.object({
      dislikeCount: z.number(),
      likeCount: z.number(),
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
    category: true,
    id: true,
    logoUrl: true,
    name: true,
    path: true,
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
      dislikeCount: z.number(),
      likeCount: z.number(),
      professorId: z.string().nullable(),
      professorName: z.string().nullable(),
    }),
  );

export const getTutorialResponseSchema = joinedTutorialSchema.merge(
  z.object({
    professor: formattedProfessorSchema.optional(),
  }),
);
