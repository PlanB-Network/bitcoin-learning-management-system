import {
  createTRPCClient,
  createTRPCReact,
  httpBatchLink,
} from '@trpc/react-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import type { AppRouter } from '@sovereign-university/api/server';

import { getDomain, isDevelopmentEnvironment } from './misc';

export type TRPCRouterInput = inferRouterInputs<AppRouter>;
export type TRPCRouterOutput = inferRouterOutputs<AppRouter>;

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
