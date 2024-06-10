/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-unresolved */
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
