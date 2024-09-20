import { builderLocationSchema } from '@blms/schemas';
import { createGetBuildersLocations } from '@blms/service-content';

import { publicProcedure } from '#src/procedures/index.js';
import { createTRPCRouter } from '#src/trpc/index.js';

const getBuildersLocationsProcedure = publicProcedure
  .output(builderLocationSchema.array())
  .query(({ ctx }) => createGetBuildersLocations(ctx.dependencies)());

export const builderLocationRouter = createTRPCRouter({
  getBuildersLocations: getBuildersLocationsProcedure,
});
