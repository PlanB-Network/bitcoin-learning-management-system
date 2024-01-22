/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';

import { createMiddleware } from '../trpc';

// Helper function to sort an object
const sortObject = (obj: any): any => {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);

  return Object.keys(obj)
    .sort()
    .reduce((result: { [key: string]: any }, key) => {
      result[key] = sortObject(obj[key]);
      return result;
    }, {});
};

const hashObject = (obj: any): string => {
  const sortedObj = sortObject(obj);
  const str = JSON.stringify(sortedObj);

  return crypto.createHash('sha256').update(str).digest('hex');
};

export const cacheMiddleware = createMiddleware(
  async ({ ctx, next, path, type, rawInput }) => {
    const {
      dependencies: { redis },
    } = ctx;

    if (type === 'query' && path.startsWith('content.')) {
      const inputHash = rawInput ? hashObject(rawInput) : 'no-input';
      const key = `trpc:${path}:${inputHash}` as const;

      const cached = await redis.get(key);

      if (cached) {
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
        await redis.set(key, result.data);
      }

      return result;
    }

    return next();
  },
);
