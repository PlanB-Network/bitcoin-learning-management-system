import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentBCertificateExam,
  usersBCertificateResults,
} from '@sovereign-university/database';

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
}).merge(
  z.object({
    results: BCertificateResultsSchema.pick({
      category: true,
      score: true,
    }).array(),
  }),
);
