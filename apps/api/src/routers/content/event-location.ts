import { eventLocationSchema } from '@blms/schemas';
import { createGetEventsLocations } from '@blms/service-content';
import type { EventLocation } from '@blms/types';

import { publicProcedure } from '#src/procedures/index.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getEventsLocationsProcedure = publicProcedure
  .output<Parser<EventLocation[]>>(eventLocationSchema.array())
  .query(({ ctx }) => createGetEventsLocations(ctx.dependencies)());

export const eventLocationRouter = createTRPCRouter({
  getEventsLocations: getEventsLocationsProcedure,
});
