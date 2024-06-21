import { TRPCError } from '@trpc/server';
import type { NextFunction, Request, Response } from 'express';

import { Unauthorized } from '#src/errors.js';

import { createMiddleware } from '../trpc/index.js';

/**
 * TRPC middleware that enforces that the user is authenticated.
 */
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

/**
 * Express middleware that enforces that the user is authenticated.
 */
export const expressAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.uid) {
    throw new Unauthorized();
  }

  next();
};
