import { TRPCError, initTRPC } from '@trpc/server';
import type { inferAsyncReturnType } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import dotenv from 'dotenv';
import { getIronSession } from 'iron-session';
import superjson from 'superjson';
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from 'zod';

import type { Dependencies } from './dependencies';
import { sessionOptions } from './session';

dotenv.config();

/**
 * Session data is declared inside ./session/index.ts
 */
type IronSession = Awaited<ReturnType<typeof getIronSession>>;

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
  session: IronSession;
  dependencies: Dependencies;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createContextInner = (opts: CreateInnerContextOptions) => {
  return {
    session: opts.session,
    dependencies: opts.dependencies,
  };
};

export type ContextInner = inferAsyncReturnType<typeof createContextInner>;

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createContext = async (
  opts: CreateExpressContextOptions,
  dependencies: Dependencies
) => {
  const { req, res } = opts;

  const session = await getIronSession(req, res, sessionOptions);

  const contextInner = createContextInner({ session, dependencies });

  return {
    ...contextInner,
    req,
    res,
  } as ContextInner & CreateExpressContextOptions;
};

export type Context = inferAsyncReturnType<typeof createContext>;

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
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

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
