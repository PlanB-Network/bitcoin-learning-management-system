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
} from '@blms/api/src/trpc/types.ts';

export type TRPCRouterInput = RouterInputs;
export type TRPCRouterOutput = RouterOutputs;

export const tRPCClientOptions = {
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
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
