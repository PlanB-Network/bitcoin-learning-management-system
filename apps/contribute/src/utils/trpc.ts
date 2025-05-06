import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { createTRPCContext } from '@trpc/tanstack-react-query';

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

import superjson from 'superjson';

import type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from '@blms/api/src/trpc/types.ts';

export type TRPCRouterInput = RouterInputs;
export type TRPCRouterOutput = RouterOutputs;

export const trpc = createTRPCReact<AppRouter>();
export const trpcClient = createTRPCClient<AppRouter>({
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
});
