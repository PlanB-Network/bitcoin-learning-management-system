import { z } from 'zod';

import { joinedCourseSchema } from './course.js';
import { joinedProfessorSchema } from './professor.js';
import { joinedTutorialLightSchema } from './tutorial.js';

export const fullProfessorSchema = joinedProfessorSchema
  .omit({
    websiteUrl: true,
    twitterUrl: true,
    githubUrl: true,
    nostr: true,
    lightningAddress: true,
    lnurlPay: true,
    paynym: true,
    silentPayment: true,
    tipsUrl: true,
  })
  .merge(
    z.object({
      links: z.object({
        website: joinedProfessorSchema.shape.websiteUrl,
        twitter: joinedProfessorSchema.shape.twitterUrl,
        github: joinedProfessorSchema.shape.githubUrl,
        nostr: joinedProfessorSchema.shape.nostr,
      }),
      tips: z.object({
        lightningAddress: joinedProfessorSchema.shape.lightningAddress,
        lnurlPay: joinedProfessorSchema.shape.lnurlPay,
        paynym: joinedProfessorSchema.shape.paynym,
        silentPayment: joinedProfessorSchema.shape.silentPayment,
        url: joinedProfessorSchema.shape.tipsUrl,
      }),
      picture: z.string(),
    }),
  )
  .merge(
    z.object({
      courses: joinedCourseSchema.array(),
      tutorials: joinedTutorialLightSchema.array(),
    }),
  );
