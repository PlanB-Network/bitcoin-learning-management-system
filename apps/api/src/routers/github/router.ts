import { createResourcePRSchema } from '@blms/schemas';
import { createResourcePR } from '#src/services/github/pr.js';
import { studentProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

export const githubRouter = createTRPCRouter({
  createResourcePR: studentProcedure
    .input(createResourcePRSchema)
    .mutation(async ({ input, ctx }) => {
      return createResourcePR(ctx.dependencies, input);
    }),
});
