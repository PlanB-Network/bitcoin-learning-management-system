import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

import type { AppRouter } from '@sovereign-academy/api-server';
import { LocalStorageKey } from '@sovereign-academy/types';

export const trpc = createTRPCReact<AppRouter>();

export const client = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
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
