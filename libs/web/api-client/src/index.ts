import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

import type { AppRouter } from '@sovereign-university/api/server';
import { LocalStorageKey } from '@sovereign-university/types';

export const trpc = createTRPCReact<AppRouter>();
export const client = trpc.createClient({
  links: [
    httpBatchLink({
      url:
        process.env['NODE_ENV'] === 'development'
          ? 'http://localhost:3000/api/trpc'
          : 'https://api.sovereignuniversity.org/trpc',
      headers: () => {
        return {
          authorization:
            window?.localStorage?.getItem(LocalStorageKey.AccessToken) ?? '',
        };
      },
    }),
  ],
  transformer: superjson,
});
