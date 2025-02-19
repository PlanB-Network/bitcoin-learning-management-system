import { TRPCError } from '@trpc/server';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { UserRole } from '@blms/constants';
import { createGetActiveApiKey } from '@blms/service-user';

import type { Dependencies } from '#src/dependencies.js';
import { Unauthorized } from '#src/errors.js';

import { createMiddleware } from '../trpc/index.js';

/**
 * TRPC middleware that loads the user context from the session.
 * Must be used before any other middleware that requires the user context.
 */
export const loadContextMiddleware = createMiddleware(({ ctx, next }) => {
  const { req } = ctx;

  const userRole = req.session.role;
  const userId = req.session.uid;

  return next({
    ctx: { user: { uid: userId, role: userRole } },
  });
});

/**
 * TRPC middleware that enforces that the user is authenticated.
 */
export const enforceAuthenticatedUserMiddleware = (requiredRole: UserRole) => {
  return createMiddleware(({ ctx, next }) => {
    // For every role, user must be logged in
    if (!ctx.user?.uid || !ctx.user?.role) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const { role, uid } = ctx.user;

    // Super admin case
    if (requiredRole === UserRole.Superadmin && role !== UserRole.Superadmin) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Current user is not an admin
    if (role !== UserRole.Superadmin && role !== UserRole.Admin) {
      // Admin case
      if (requiredRole === UserRole.Admin) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Professor case
      if (requiredRole === UserRole.Professor && role !== UserRole.Professor) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Community case
      if (requiredRole === UserRole.Community && role !== UserRole.Community) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
    }

    return next({ ctx: { user: { role, uid } } });
  });
};

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

/**
 * Express middleware to check for a valid api key.
 */
export const createApiKeyMiddleware = (ctx: Dependencies): RequestHandler => {
  const headerRegex =
    /^Bearer (?<keyId>[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12})$/;
  const getActiveApiKey = createGetActiveApiKey(ctx);

  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      return void res.status(401).send('Unauthorized');
    }

    const keyId = headerRegex.exec(header)?.groups?.keyId;
    if (!keyId) {
      return void res.status(401).send('Unauthorized (invalid api key)');
    }

    return getActiveApiKey(keyId)
      .then((key) => (key ? next() : void res.status(401).send('Unauthorized')))
      .catch(() => void res.status(500).send('Internal server error'));
  };
};

/**
 * Express middleware that does nothing.
 */
export const noopMiddleware: RequestHandler = (_req, _res, next) => next();
