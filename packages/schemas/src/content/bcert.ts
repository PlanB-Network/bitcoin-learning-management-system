import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentBCertificateExam,
  usersBCertificateResults,
  usersBCertificateTimestamps,
} from '@blms/database';

export const BCertExamSchema = createSelectSchema(contentBCertificateExam);

export const BCertResultsSchema = createSelectSchema(usersBCertificateResults);

export const BCertTimestampsSchema = createSelectSchema(
  usersBCertificateTimestamps,
);

export const JoinedBCertResultsSchema = BCertExamSchema.pick({
  id: true,
  date: true,
  location: true,
  minScore: true,
  duration: true,
  path: true,
  lastUpdated: true,
  lastCommit: true,
})
  .merge(
    BCertTimestampsSchema.pick({
      pdfKey: true,
      imgKey: true,
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
