import { randomBytes } from 'crypto';
import { createHmac } from 'node:crypto';

import { bech32 } from 'bech32';

import { Dependencies } from '../../../dependencies';

const encodeUrlToLnurl = (url: string) => {
  const prefix = 'lnurl';
  const limit = 1023;
  const words = bech32.toWords(Buffer.from(url, 'utf8'));
  return bech32.encode(prefix, words, limit);
};

export const createGenerateLnurlAuth =
  (dependencies: Dependencies) =>
  async ({ sessionId }: { sessionId?: string }) => {
    const { redis } = dependencies;

    if (!sessionId) {
      throw new Error('Session not found');
    }

    const session = await redis.get(`session:${sessionId}`);

    if (!session) {
      throw new Error('Session not found');
    }

    const tag = 'login';
    const k1 = randomBytes(32).toString('hex');

    const hmac = createHmac('sha256', 'secret')
      .update(`${tag}${k1}`)
      .digest('hex');

    const host =
      process.env['NODE_ENV'] === 'production'
        ? `https://api.${process.env['DOMAIN']}`
        : 'http://localhost:3000/api';

    const url = new URL(`${host}/auth/lud4`);
    url.searchParams.append('tag', tag);
    url.searchParams.append('k1', k1);
    url.searchParams.append('hmac', hmac);

    const lnurl = encodeUrlToLnurl(url.toString());

    await redis.setWithExpiry(`lnurl-auth:${k1}`, { sessionId, session }, 300);

    console.log(`Generate ${sessionId}`);

    return { lnurl };
  };
