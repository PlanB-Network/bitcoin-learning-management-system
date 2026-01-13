import { createResourcePRSchema } from '@blms/schemas';

import { studentProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

export const githubRouter = createTRPCRouter({
  createResourcePR: studentProcedure
    .input(createResourcePRSchema)
    .mutation(async ({ input, ctx }) => {
      const { createResourcePR } = await import('../../services/github/pr.js');

      return createResourcePR(ctx.dependencies, input);
    }),
});
