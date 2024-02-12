import { enforceAuthenticatedUserMiddleware } from '../middlewares/index.js';

import { publicProcedure } from './public.js';

export const protectedProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware,
);
