import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentBCertificateExam,
  usersBCertificateResults,
} from '@blms/database';

export const BCertificateExamSchema = createSelectSchema(
  contentBCertificateExam,
);

export const BCertificateResultsSchema = createSelectSchema(
  usersBCertificateResults,
);

export const JoinedBCertificateResultsSchema = BCertificateExamSchema.pick({
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
    z.object({
      results: BCertificateResultsSchema.pick({
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
