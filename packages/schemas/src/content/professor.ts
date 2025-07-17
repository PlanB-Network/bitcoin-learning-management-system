import { contentProfessors, contentProfessorsLocalized } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const professorSchema = createSelectSchema(contentProfessors);

export const professorLocalizedSchema = createSelectSchema(
  contentProfessorsLocalized,
);

export const joinedProfessorSchema = professorSchema
  .merge(
    professorLocalizedSchema.pick({
      bio: true,
      language: true,
      shortBio: true,
    }),
  )
  .merge(
    z.object({
      coursesCount: z.number(),
      coursesIndexes: z.array(z.string()),
      lecturesCount: z.number(),
      tags: z.array(z.string()),
      tutorialsCount: z.number(),
    }),
  );

export const formattedProfessorSchema = joinedProfessorSchema
  .omit({
    githubUrl: true,
    lightningAddress: true,
    linkedinUrl: true,
    lnurlPay: true,
    nostr: true,
    paynym: true,
    silentPayment: true,
    tipsUrl: true,
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
  );
