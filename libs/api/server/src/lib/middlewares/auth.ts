import { TRPCError } from '@trpc/server';

import { createMiddleware } from '../trpc';

export const enforceAuthenticatedUserMiddleware = createMiddleware(
  ({ ctx, next }) => {
    const { req } = ctx;

    if (!req.session.uid) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return next({
      ctx: { user: { uid: req.session.uid } },
    });
  },
);
