import { z } from 'zod';

import { joinedProofreadingSchema } from '@blms/schemas';
import { createGetProofreading } from '@blms/service-content';
import type { JoinedProofreading } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getProofreadingProcedure = publicProcedure
  .input(
    z.object({
      language: z.string(),
      courseId: z.string().optional(),
      tutorialId: z.number().optional(),
      resourceId: z.number().optional(),
    }),
  )
  .output<Parser<JoinedProofreading | null>>(
    joinedProofreadingSchema.nullable(),
  )
  .query(({ ctx, input }) =>
    createGetProofreading(ctx.dependencies)(
      input.language,
      input.courseId,
      input.tutorialId,
      input.resourceId,
    ),
  );

export const proofreadingsRouter = createTRPCRouter({
  getProofreading: getProofreadingProcedure,
});
