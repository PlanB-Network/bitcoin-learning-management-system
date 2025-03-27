import type { RequestHandler } from 'express';
import session, { Store, type SessionData } from 'express-session';

import type { SessionConfig } from '@blms/types';

import type { PostgresClient } from '@blms/database';
import { firstRow, sql } from '@blms/database';
import type { Dependencies } from '../../dependencies.js';

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

class PostgresStore extends Store {
  constructor(private readonly client: PostgresClient) {
    super();
  }

  override get(
    sid: string,
    callback: (err: any, session?: SessionData | null) => void,
  ): void {
    this.client
      .exec(
        sql<SessionData[]>`
          SELECT
            sessions.sid,
            sessions.cookie,
            sessions.expires,
            accounts.uid,
            accounts.role,
            accounts.permissions
          FROM users.sessions
          LEFT JOIN users.accounts
            ON sessions.uid = accounts.uid
          WHERE sid = ${sid}
            AND expires > NOW()
          LIMIT 1;
        `,
      )
      .then(firstRow)
      .then((row) => callback(null, row ?? null))
      .catch((error) => callback(error));
  }

  override set(
    sid: string,
    session: SessionData,
    callback?: (err?: any) => void,
  ): void {
    if (!session.uid) {
      callback?.();
      return;
    }

    this.client
      .exec(
        sql`
          INSERT INTO users.sessions (sid, uid, expires, cookie)
          VALUES (${sid}, ${session.uid}, ${session.cookie.expires?.toISOString() || "NOW() + INTERVAL '1 week'"}, ${session.cookie as any}::jsonb)
        `,
      )
      .then(() => callback?.())
      .catch((error) => callback?.(error));
  }

  override destroy(sid: string, callback?: (err?: any) => void): void {
    this.client
      .exec(
        sql`
          DELETE FROM users.sessions
          WHERE sid = ${sid}
        `,
      )
      .then(() => callback?.())
      .catch((error) => callback?.(error));
  }
}

export const createCookieSessionMiddleware = ({
  postgres,
  config,
}: Dependencies): RequestHandler => {
  const sessionConfig = getSessionConfig(config.session);

  const store = new PostgresStore(postgres);

  return session({
    ...sessionConfig,
    store,
  });
};
