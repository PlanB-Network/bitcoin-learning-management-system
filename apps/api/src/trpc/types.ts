import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '../routers/router.js';

export type { AppRouter } from '../routers/router.js';

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
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
