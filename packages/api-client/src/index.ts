import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

import type { AppRouter } from '@sovereign-academy/api-server';

export const createTrpcClient = () =>
  createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: '/api' })],
  } as any);
