import { z } from 'zod';

import { createLikeTutorial } from '@blms/user';

import { protectedProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';

const likeTutorialProcedure = protectedProcedure
  .input(z.object({ id: z.number(), liked: z.boolean() }))
  .mutation(({ ctx, input }) =>
    createLikeTutorial(ctx.dependencies)({
      uid: ctx.user.uid,
      // tutorial id
      id: input.id,
      liked: input.liked,
    }),
  );

export const userTutorialsRouter = createTRPCRouter({
  likeTutorial: likeTutorialProcedure,
});
