import {
  contentBCertificateExam,
  usersBCertificateResults,
  usersBCertificateTimestamps,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const BCertExamSchema = createSelectSchema(contentBCertificateExam);

export const BCertResultsSchema = createSelectSchema(usersBCertificateResults);

export const BCertTimestampsSchema = createSelectSchema(
  usersBCertificateTimestamps,
);

export const JoinedBCertResultsSchema = BCertExamSchema.pick({
  date: true,
  duration: true,
  id: true,
  lastCommit: true,
  lastUpdated: true,
  location: true,
  minScore: true,
  path: true,
})
  .merge(
    BCertTimestampsSchema.pick({
      imgKey: true,
      pdfKey: true,
      txtKey: true,
      txtOtsKey: true,
    }),
  )
  .merge(
    z.object({
      results: BCertResultsSchema.pick({
        category: true,
        score: true,
      }).array(),
      score: z.number().optional(),
    }),
  )
  .transform((data) => {
    const totalScore = data.results.reduce(
      (acc, result) => acc + result.score,
      0,
    );

    return {
      ...data,
      score: totalScore,
    };
  })
  .refine((data) => typeof data.score === 'number', {
    message: 'Score must be a valid number after transformation',
  });
