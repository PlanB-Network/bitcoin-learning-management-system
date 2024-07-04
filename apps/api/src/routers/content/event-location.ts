import { createGetEventsLocations } from '@sovereign-university/content';
import { eventLocationSchema } from '@sovereign-university/schemas';

import { publicProcedure } from '#src/procedures/index.js';
import { createTRPCRouter } from '#src/trpc/index.js';

const getEventsLocationsProcedure = publicProcedure
  .output(eventLocationSchema.array())
  .query(({ ctx }) => createGetEventsLocations(ctx.dependencies)());

export const eventLocationRouter = createTRPCRouter({
  getEventsLocations: getEventsLocationsProcedure,
});
