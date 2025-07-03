import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import {
  createTRPCContext,
  createTRPCOptionsProxy,
} from '@trpc/tanstack-react-query';
import superjson from 'superjson';

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

import type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from '@blms/api/src/trpc/types.ts';

export type TRPCRouterInput = RouterInputs;
export type TRPCRouterOutput = RouterOutputs;

export const queryClient = new QueryClient();

export const tRPCClientOptions = {
  links: [
    httpBatchLink({
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
      transformer: superjson,
      url: '/api/trpc',
    }),
  ],
};

export const trpcClient = createTRPCClient<AppRouter>(tRPCClientOptions);
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
