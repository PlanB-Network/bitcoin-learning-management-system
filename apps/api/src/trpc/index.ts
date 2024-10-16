/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { initTRPC } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import * as dotenv from 'dotenv';
import superjson from 'superjson';
import { ZodError } from 'zod';

import type { Dependencies } from '../dependencies.js';

dotenv.config();

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
interface CreateInnerContextOptions {
  dependencies: Dependencies;
}

export interface InnerContext {
  dependencies: Dependencies;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createContextInner = (opts: CreateInnerContextOptions): InnerContext => {
  return {
    dependencies: opts.dependencies,
  };
};

interface UserContext {
  user?: {
    uid: string;
  };
}

interface SessionContext {
  sessionId?: string;
}

export type Context = InnerContext &
  SessionContext &
  CreateExpressContextOptions &
  UserContext;

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createContext = (
  opts: CreateExpressContextOptions,
  dependencies: Dependencies,
): Context => {
  const contextInner = createContextInner({ dependencies });

  return {
    ...opts,
    ...contextInner,
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
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.errors : null,
      },
    };
  },
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
