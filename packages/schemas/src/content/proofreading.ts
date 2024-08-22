import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentProofreading,
  contentProofreadingContributor,
} from '@blms/database';

export const proofreadingSchema = createSelectSchema(contentProofreading);
export const proofreadingContributorSchema = createSelectSchema(
  contentProofreadingContributor,
);
export const joinedProofreadingSchema = proofreadingSchema.merge(
  z.object({
    contributorsId: z.string().array(),
  }),
);
