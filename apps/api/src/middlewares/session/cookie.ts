import RedisStore from 'connect-redis';
import type { RequestHandler } from 'express';
import session from 'express-session';

import type { SessionConfig } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';

const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

const getSessionConfig = (config: SessionConfig) => {
  return {
    name: config.cookieName,
    secret: config.secret,
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      domain: config.domain,
      maxAge: config.maxAge,
      httpOnly: true,
      path: '/',
      secure: config.secure,
      sameSite: 'strict' as const,
    },
  };
};

export const createCookieSessionMiddleware = ({
  redis,
  config,
}: Dependencies): RequestHandler => {
  const sessionConfig = getSessionConfig(config.session);

  const redisStore = new RedisStore({
    client: redis.duplicate(),
    prefix: 'session:',
    ttl: ONE_WEEK,
  });

  return session({
    ...sessionConfig,
    store: redisStore,
  });
};
