import type { RequestHandler } from 'express';
import session, { Store } from 'express-session';

import type { SessionConfig } from '@blms/types';

import type { PostgresClient } from '@blms/database';
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

interface StoreOptions {
  ttl?: number;
}

class PostgresStore extends Store {
  private mock = new Map<string, session.SessionData>();

  constructor(
    private readonly client: PostgresClient,
    private readonly options?: StoreOptions,
  ) {
    super();
  }

  override get(
    sid: string,
    callback: (err: any, session?: session.SessionData | null) => void,
  ): void {
    callback(null, this.mock.get(sid) ?? null);
  }

  override set(
    sid: string,
    session: session.SessionData,
    callback?: (err?: any) => void,
  ): void {
    this.mock.set(sid, session);

    callback?.();
  }

  override destroy(sid: string, callback?: (err?: any) => void): void {
    this.mock.delete(sid);

    callback?.();
  }
}

export const createCookieSessionMiddleware = ({
  postgres,
  config,
}: Dependencies): RequestHandler => {
  const sessionConfig = getSessionConfig(config.session);

  const store = new PostgresStore(postgres, {
    ttl: ONE_WEEK,
  });

  return session({
    ...sessionConfig,
    store,
  });
};
