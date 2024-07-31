import { TRPCError } from '@trpc/server';
import type { NextFunction, Request, Response } from 'express';

import { Unauthorized } from '#src/errors.js';

import { createMiddleware } from '../trpc/index.js';

/**
 * TRPC middleware that enforces that the user is authenticated.
 */
export const enforceAuthenticatedUserMiddleware = (
  requiredRole: 'student' | 'professor' | 'community' | 'admin' | 'superadmin',
) =>
  createMiddleware(({ ctx, next }) => {
    const { req } = ctx;

    const userRole = req.session.role;
    const userId = req.session.uid;

    // For every role, user must be logged in
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Super admin case
    if (requiredRole === 'superadmin' && userRole !== 'superadmin') {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Current user is not an admin
    if (userRole !== 'superadmin' && userRole !== 'admin') {
      // Admin case
      if (requiredRole === 'admin') {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Professor case
      if (requiredRole === 'professor' && userRole !== 'professor') {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Community case
      if (requiredRole === 'community' && userRole !== 'community') {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
    }

    return next({
      ctx: { user: { uid: userId, role: userRole } },
    });
  });

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
