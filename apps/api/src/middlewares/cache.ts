/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'node:crypto';

import { createMiddleware } from '../trpc/index.js';

// Helper function to sort an object
const sortObject = (obj: any): any => {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((element) => sortObject(element));

  return (
    Object.keys(obj)
      .sort()
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce((result: { [key: string]: any }, key) => {
        result[key] = sortObject(obj[key]);
        return result;
      }, {})
  );
};

const hashObject = (obj: any): string => {
  const sortedObj = sortObject(obj);
  const str = JSON.stringify(sortedObj);

  return crypto.createHash('sha256').update(str).digest('hex');
};

export const cacheMiddleware = createMiddleware(
  async ({ ctx, next, path, type, getRawInput }) => {
    const {
      dependencies: { redis },
    } = ctx;

    if (type === 'query' && path.startsWith('content.')) {
      const rawInput = await getRawInput();

      const inputHash = rawInput ? hashObject(rawInput) : 'no-input';
      const key = `trpc:${path}:${inputHash}` as const;

      const cached = await redis.get(key);

      if (cached && process.env.NODE_ENV !== 'development') {
        console.log(`Cache hit for ${key}`);
        return {
          marker: 'middlewareMarker' as 'middlewareMarker' & {
            __brand: 'middlewareMarker';
          },
          ok: true,
          data: cached,
          ctx,
        };
      }

      const result = await next();

      if (result.ok) {
        await redis.setWithExpiry(key, result.data, 86_400);
      }

      return result;
    }

    return next();
  },
);
