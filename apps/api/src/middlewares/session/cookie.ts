import process from 'node:process';

import SessionStore from 'connect-redis';
import session from 'express-session';

import type { Dependencies } from '../../dependencies.js';

const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

export const getSessionConfig = () => {
  return {
    name: process.env.SESSION_COOKIE_NAME || 'session',
    secret: process.env.SESSION_SECRET || 'super secret',
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      domain:
        process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
      maxAge: ONE_WEEK,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    },
  };
};

export const createCookieSessionMiddleware = (
  dependencies: Dependencies,
): ReturnType<typeof session> => {
  const sessionConfig = getSessionConfig();

  const { redis } = dependencies;

  return session({
    ...sessionConfig,
    store: new SessionStore({
      client: redis.duplicate(),
      prefix: 'session:',
      ttl: ONE_WEEK,
    }),
  });
};
