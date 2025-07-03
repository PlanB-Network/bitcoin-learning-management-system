import {
  createGetExistingLikeTutorial,
  createLikeTutorial,
} from '@blms/service-user';
import { z } from 'zod';

import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const likeTutorialProcedure = studentProcedure
  .input(z.object({ id: z.string(), liked: z.boolean() }))
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createLikeTutorial(ctx.dependencies)({
      // tutorial id
      id: input.id,
      liked: input.liked,
      uid: ctx.user.uid,
    }),
  );

const getExistingLikeTutorialProcedure = studentProcedure
  .input(z.object({ id: z.string() }))
  .query(({ ctx, input }) =>
    createGetExistingLikeTutorial(ctx.dependencies)({
      // tutorial id
      id: input.id,
      uid: ctx.user.uid,
    }),
  );

export const userTutorialsRouter = createTRPCRouter({
  getExistingLikeTutorial: getExistingLikeTutorialProcedure,
  likeTutorial: likeTutorialProcedure,
});
