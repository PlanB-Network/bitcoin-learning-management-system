import { enforceAuthenticatedUserMiddleware } from '#src/middlewares/auth.js';

import { publicProcedure } from './public.js';

export const studentProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware('student'),
);

export const professorProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware('professor'),
);

export const communityProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware('community'),
);

export const adminProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware('admin'),
);

export const superadminProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware('superadmin'),
);
