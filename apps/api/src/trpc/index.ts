import type { UserPermission, UserRole } from '@blms/constants';
import type { LogContext } from '@blms/types';
import { initTRPC } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import * as dotenv from 'dotenv';
import superjson from 'superjson';
import { ZodError } from 'zod';

import type { Dependencies } from '../dependencies.js';

dotenv.config();

export interface InnerContext {
  dependencies: Dependencies & LogContext;
}

interface UserContext {
  user?: {
    uid: string;
    role: UserRole;
    permissions?: UserPermission[];
  };
}

interface SessionContext {
  sessionId?: string;
  requestId: string;
}

export type Context = InnerContext &
  SessionContext &
  CreateExpressContextOptions &
  UserContext &
  LogContext;

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createContext = (
  opts: CreateExpressContextOptions,
  dependencies: Dependencies,
): Context => {
  const log = opts.req.log || (() => {});

  return {
    ...opts,
    dependencies: { ...dependencies, log },
    log,
    requestId: opts.req.id,
    sessionId: opts.req.session?.id,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ ctx, shape, error }) {
    ctx?.log('ERROR:', error.message, error.name, error.code);
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.errors : null,
      },
    };
  },
  transformer: superjson,
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;
export const mergeTRPCRouters = t.mergeRouters;
export const createMiddleware = t.middleware;
export const createProcedure = () => t.procedure;
