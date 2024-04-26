import { TRPCError } from '@trpc/server';

import { createMiddleware } from '../trpc/index.js';

export const enforceAuthenticatedUserMiddleware = createMiddleware(
  ({ ctx, next }) => {
    const { req } = ctx;

    console.log('req session', req.session);
    if (!req.session.uid) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return next({
      ctx: { user: { uid: req.session.uid } },
    });
  },
);
