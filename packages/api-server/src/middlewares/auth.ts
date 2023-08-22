import { TRPCError } from '@trpc/server';
import { verify } from 'jsonwebtoken';

import { JwtAuthTokenPayload } from '@sovereign-academy/types';

import { createMiddleware } from '../trpc';

const AUTH_HEADER_KEY = 'authorization';

export const enforceAuthenticatedUserMiddleware = createMiddleware(
  ({ ctx, next }) => {
    const authHeader = ctx.req.headers[AUTH_HEADER_KEY];
    if (!authHeader || Array.isArray(authHeader))
      throw new TRPCError({ code: 'UNAUTHORIZED' });

    let payload: JwtAuthTokenPayload;
    try {
      payload = verify(
        authHeader,
        process.env['JWT_SECRET'] as string
      ) as JwtAuthTokenPayload; // TODO validate payload with zod insteadƒ
    } catch {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return next({
      ctx: {
        user: payload,
      },
    });
  }
);
