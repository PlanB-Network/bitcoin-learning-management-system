import { createGetEventsLocations } from '@blms/content';
import { eventLocationSchema } from '@blms/schemas';

import { publicProcedure } from '#src/procedures/index.js';
import { createTRPCRouter } from '#src/trpc/index.js';

const getEventsLocationsProcedure = publicProcedure
  .output(eventLocationSchema.array())
  .query(({ ctx }) => createGetEventsLocations(ctx.dependencies)());

export const eventLocationRouter = createTRPCRouter({
  getEventsLocations: getEventsLocationsProcedure,
});
