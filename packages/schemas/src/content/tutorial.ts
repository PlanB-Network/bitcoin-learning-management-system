import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentTutorialCredits,
  contentTutorialLikesDislikes,
  contentTutorials,
  contentTutorialsLocalized,
} from '@blms/database';

import { joinedBuilderSchema } from './builder.js';
import {
  formattedProfessorSchema,
  joinedProfessorSchema,
} from './professor.js';

export const tutorialSchema = createSelectSchema(contentTutorials);
export const tutorialLocalizedSchema = createSelectSchema(
  contentTutorialsLocalized,
);
export const tutorialCreditSchema = createSelectSchema(contentTutorialCredits);

export const tutorialLikeDislikeSchema = createSelectSchema(
  contentTutorialLikesDislikes,
);

export const joinedTutorialLightSchema = tutorialSchema
  .pick({
    id: true,
    path: true,
    name: true,
    level: true,
    category: true,
    subcategory: true,
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

export const getTutorialResponseSchema = joinedTutorialSchema.merge(
  z.object({
    credits: joinedTutorialCreditSchema
      .omit({
        tutorialId: true,
        contributorId: true,
        lightningAddress: true,
        lnurlPay: true,
        paynym: true,
        silentPayment: true,
        tipsUrl: true,
      })
      .merge(
        z.object({
          professor: formattedProfessorSchema.optional(),
          tips: z.object({
            lightningAddress: joinedTutorialCreditSchema.shape.lightningAddress,
            lnurlPay: joinedTutorialCreditSchema.shape.lnurlPay,
            paynym: joinedTutorialCreditSchema.shape.paynym,
            silentPayment: joinedTutorialCreditSchema.shape.silentPayment,
            url: joinedTutorialCreditSchema.shape.tipsUrl,
          }),
        }),
      )
      .optional(),
  }),
);
