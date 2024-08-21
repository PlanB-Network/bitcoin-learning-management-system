import { createSelectSchema } from 'drizzle-zod';

import {
  contentProofreading,
  contentProofreadingContributor,
} from '@blms/database';

export const proofreadingSchema = createSelectSchema(contentProofreading);
export const proofreadingContributorSchema = createSelectSchema(
  contentProofreadingContributor,
);
