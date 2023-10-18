import {
  createTRPCProxyClient,
  createTRPCReact,
  httpBatchLink,
} from '@trpc/react-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { SuperJSON } from 'superjson';

import type { AppRouter } from '@sovereign-university/api/server';

import { getDomain, isDevelopmentEnvironment } from './misc';

export type TRPCRouterInput = inferRouterInputs<AppRouter>;
export type TRPCRouterOutput = inferRouterOutputs<AppRouter>;

export const tRPCClientOptions = {
  links: [
    httpBatchLink({
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
  transformer: SuperJSON,
};

export const trpc = createTRPCReact<AppRouter>();
export const trpcClient = createTRPCProxyClient<AppRouter>(tRPCClientOptions);
