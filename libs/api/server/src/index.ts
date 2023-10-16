import type {} from 'express-serve-static-core';
import type {} from 'qs';
import 'express-session';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    uid?: string;
  }
}

export * from './lib';
