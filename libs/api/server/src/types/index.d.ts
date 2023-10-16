import 'express-session';

declare global {
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
