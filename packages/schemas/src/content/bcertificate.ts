import { createSelectSchema } from 'drizzle-zod';

import { contentBCertificateExam } from '@sovereign-university/database';

export const BCertificateExamSchema = createSelectSchema(
  contentBCertificateExam,
);
