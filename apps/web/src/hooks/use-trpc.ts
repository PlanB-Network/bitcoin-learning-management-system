import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { useState } from 'react';
// import { useSessionStore } from '../stores/session.ts';

import { userSlice } from '../store/index.js';
import { trpc } from '../utils/index.js';
import { tRPCClientOptions } from '../utils/trpc.js';

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
      if (
        error.shape &&
        ['UNAUTHORIZED', 'FORBIDDEN'].includes(error.shape.data.code)
      ) {
        console.error('Try to access an unauthorized resource');
        // userSlice.actions.logout();
      }
    } else if (error instanceof Error) {
      console.error(error.message);
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
      }),
  );

  const [trpcClient] = useState(() => trpc.createClient(tRPCClientOptions));

  return {
    trpcQueryClient,
    trpcClient,
  };
};
