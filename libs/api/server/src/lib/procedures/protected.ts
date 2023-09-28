import { enforceAuthenticatedUserMiddleware } from '../middlewares';
import { publicProcedure } from './public';

export const protectedProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware
);
