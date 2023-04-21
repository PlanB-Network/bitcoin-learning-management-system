import type { IronSessionOptions } from 'iron-session';

export interface User {
  isLoggedIn: boolean;
  username: string;
  email?: string;
}

export interface Session {
  user?: User;
}

export const sessionOptions: IronSessionOptions = {
  password: process.env['IRON_SESSION_SECRET'] as string,
  cookieName: 'sovereign-academy',
  cookieOptions: {
    secure: process.env['NODE_ENV'] === 'production',
  },
};

declare module 'iron-session' {
  interface IronSessionData {
    user?: User;
  }
}
