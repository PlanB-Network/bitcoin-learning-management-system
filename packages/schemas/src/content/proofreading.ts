import {
  contentProofreading,
  contentProofreadingContributor,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const proofreadingSchema = createSelectSchema(contentProofreading);
export const proofreadingContributorSchema = createSelectSchema(
  contentProofreadingContributor,
);
export const joinedProofreadingSchema = proofreadingSchema.merge(
  z.object({
    contributorNames: z.string().array(),
  }),
);
