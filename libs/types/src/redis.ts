/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Session, SessionData } from 'express-session';

import type { NonFunctionProperties } from './utils';

type RedisSession = NonFunctionProperties<Session> & SessionData;

export interface RedisKeyValue {
  [key: `session:${string}`]: RedisSession;
  [key: `lnurl-auth:${string}`]: {
    session: RedisSession;
    sessionId: string;
  };
  [key: `trpc:${string}`]: any;
}

export type RedisKey = keyof RedisKeyValue;
