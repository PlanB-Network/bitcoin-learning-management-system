import { cacheMiddleware } from '../middlewares/cache.js';
import { createProcedure } from '../trpc/index.js';

export const publicProcedure = createProcedure().use(cacheMiddleware);
