import {
  createTRPCClient,
  createTRPCReact,
  httpBatchLink,
} from '@trpc/react-query';
import superjson from 'superjson';

import type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from '../../../api/src/trpc/types.ts';

import { getDomain, isDevelopmentEnvironment } from './misc.ts';

export type TRPCRouterInput = RouterInputs;
export type TRPCRouterOutput = RouterOutputs;

export const tRPCClientOptions = {
  links: [
    httpBatchLink({
      transformer: superjson,
      url: isDevelopmentEnvironment()
        ? 'http://localhost:3000/api/trpc'
        : `https://api.${getDomain()}/trpc`,
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
};

export const trpc = createTRPCReact<AppRouter>();
export const trpcClient = createTRPCClient<AppRouter>(tRPCClientOptions);
