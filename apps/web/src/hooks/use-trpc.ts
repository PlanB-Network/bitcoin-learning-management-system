import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { TRPCClientError, httpBatchLink } from '@trpc/client';
import { useState } from 'react';

// import { useSessionStore } from '../stores/session.ts';
import { getDomain, trpc } from '../utils/index.js';
import superjson from 'superjson';
import { LocalStorageKey } from '@sovereign-university/types';

interface Meta {
  globalErrorHandler?: boolean;
}

declare module '@tanstack/react-query' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface QueryMeta extends Meta {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface MutationMeta extends Meta {}
}

export const useTrpc = () => {
  // TODO: replace console logs by toast once we have our UI library

  const onError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      if (['UNAUTHORIZED', 'FORBIDDEN'].includes(error.shape.data.code)) {
        // useSessionStore.getState().logout();
      }
      console.log(error.message);
    } else if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.error(error);
    }
  };

  const [trpcQueryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Number.POSITIVE_INFINITY,
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
        queryCache: new QueryCache({ onError }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.globalErrorHandler === false) return;
            onError(error);
          },
        }),
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `https://${getDomain()}/trpc`,
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              credentials: 'include',
            });
          },
          headers: () => {
            return {
              authorization:
                window?.localStorage?.getItem(LocalStorageKey.AccessToken) ??
                '',
            };
          },
        }),
      ],
      transformer: superjson,
    })
  );

  return {
    trpcQueryClient,
    trpcClient,
  };
};
