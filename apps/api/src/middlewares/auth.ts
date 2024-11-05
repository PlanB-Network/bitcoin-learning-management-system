import { TRPCError } from '@trpc/server';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { createGetApiKey } from '@blms/service-user';
import type { UserRole } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';
import { Unauthorized } from '#src/errors.js';

import { createMiddleware } from '../trpc/index.js';

/**
 * TRPC middleware that enforces that the user is authenticated.
 */
export const enforceAuthenticatedUserMiddleware = (requiredRole: UserRole) => {
  return createMiddleware(({ ctx, next }) => {
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
  const getApiKey = createGetApiKey(ctx);

  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      return void res.status(401).send('Unauthorized)');
    }

    const keyId = headerRegex.exec(header)?.groups?.keyId;
    if (!keyId) {
      return void res.status(401).send('Unauthorized (invalid api key)');
    }

    return getApiKey(keyId)
      .then((key) =>
        // eslint-disable-next-line promise/no-callback-in-promise
        key ? next() : void res.status(401).send('Unauthorized'),
      )
      .catch(() => void res.status(500).send('Internal server error'));
  };
};
