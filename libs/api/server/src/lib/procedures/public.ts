import { cacheMiddleware } from '../middlewares/cache';
import { createProcedure } from '../trpc';

export const publicProcedure = createProcedure().use(cacheMiddleware);
