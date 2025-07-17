import { z } from 'zod';

import { joinedCourseSchema } from './course.js';
import { joinedProfessorSchema } from './professor.js';
import { joinedTutorialLightSchema } from './tutorial.js';

export const fullProfessorSchema = joinedProfessorSchema
  .omit({
    githubUrl: true,
    lightningAddress: true,
    lnurlPay: true,
    nostr: true,
    paynym: true,
    silentPayment: true,
    tipsUrl: true,
    linkedinUrl: true,
    twitterUrl: true,
    websiteUrl: true,
  })
  .merge(
    z.object({
      links: z.object({
        github: joinedProfessorSchema.shape.githubUrl,
        nostr: joinedProfessorSchema.shape.nostr,
        linkedin: joinedProfessorSchema.shape.linkedinUrl,
        twitter: joinedProfessorSchema.shape.twitterUrl,
        website: joinedProfessorSchema.shape.websiteUrl,
      }),
      tips: z.object({
        lightningAddress: joinedProfessorSchema.shape.lightningAddress,
        lnurlPay: joinedProfessorSchema.shape.lnurlPay,
        paynym: joinedProfessorSchema.shape.paynym,
        silentPayment: joinedProfessorSchema.shape.silentPayment,
        url: joinedProfessorSchema.shape.tipsUrl,
      }),
    }),
  )
  .merge(
    z.object({
      courses: joinedCourseSchema.array(),
      tutorials: joinedTutorialLightSchema.array(),
    }),
  );
