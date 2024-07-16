import { createSelectSchema } from 'drizzle-zod';

import { usersBCertificateResults } from '@sovereign-university/database';

export const userBCertificateResultsSchema = createSelectSchema(
  usersBCertificateResults,
);
