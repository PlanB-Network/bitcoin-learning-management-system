import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

import type { TrpcRouter } from '../routers/trpc-router.js';

export type { TrpcRouter as AppRouter } from '../routers/trpc-router.js';

// TODO: duplicate of types in index.ts, improve this using custom types at the root level later?
declare module 'express-session' {
  interface SessionData {
    uid?: string;
  }
}

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<TrpcRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<TrpcRouter>;
