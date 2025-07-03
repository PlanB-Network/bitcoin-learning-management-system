import { joinedProofreadingSchema } from '@blms/schemas';
import { createGetProofreading } from '@blms/service-content';
import type { JoinedProofreading } from '@blms/types';
import { z } from 'zod';

import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getProofreadingProcedure = publicProcedure
  .input(
    z.object({
      courseId: z.string().optional(),
      language: z.string(),
      resourceId: z.string().optional(),
      tutorialId: z.string().optional(),
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
