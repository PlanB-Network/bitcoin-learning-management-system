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
} from '@sovereign-university/api/src/trpc/types.ts';

export type TRPCRouterInput = RouterInputs;
export type TRPCRouterOutput = RouterOutputs;

const isIsoDateString = (value: any): boolean => {
  const isoDateFormat = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;
  return value && typeof value === 'string' && isoDateFormat.test(value);
};

const parseDates = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  } else if (typeof obj === 'string' && isIsoDateString(obj)) {
    return new Date(obj);
  } else if (Array.isArray(obj)) {
    return obj.map((element) => parseDates(element));
  }
  return obj;
};

export const tRPCClientOptions = {
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // transformer: superjson,
      transformer: {
        serialize: (data: any) => {
          return parseDates(superjson.serialize(data));
        },
        deserialize: (data: any) => {
          return parseDates(superjson.deserialize(data));
        },
      },
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
