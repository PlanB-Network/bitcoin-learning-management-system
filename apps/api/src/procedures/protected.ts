import { UserRole } from '@blms/constants';
import { enforceAuthenticatedUserMiddleware } from '#src/middlewares/auth.js';

import { publicProcedure } from './public.js';

export const studentProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware(UserRole.Student),
);

export const professorProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware(UserRole.Professor),
);

export const communityProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware(UserRole.Community),
);

export const adminProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware(UserRole.Admin),
);

export const superadminProcedure = publicProcedure.use(
  enforceAuthenticatedUserMiddleware(UserRole.Superadmin),
);
