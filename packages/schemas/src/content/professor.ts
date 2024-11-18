/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { contentProfessors, contentProfessorsLocalized } from '@blms/database';

export const professorSchema = createSelectSchema(contentProfessors, {
  // TODO: Remove this when the issue is fixed
  // https://github.com/drizzle-team/drizzle-orm/issues/1609
  affiliations: z.array(z.string()),
});

export const professorLocalizedSchema = createSelectSchema(
  contentProfessorsLocalized,
);

export const joinedProfessorSchema = professorSchema
  .merge(
    professorLocalizedSchema.pick({
      language: true,
      bio: true,
      shortBio: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
      coursesCount: z.number(),
      coursesIds: z.array(z.string()),
      tutorialsCount: z.number(),
      lecturesCount: z.number(),
    }),
  );

export const formattedProfessorSchema = joinedProfessorSchema
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
    }),
  );
