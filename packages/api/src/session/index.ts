import type { IronSessionOptions } from 'iron-session';

export type User = {
  isLoggedIn: boolean;
  username: string;
  email?: string;
};

export const sessionOptions: IronSessionOptions = {
  // TODO: use `password: process.env.SECRET_COOKIE_PASSWORD as string` instead of harcoded password,
  password: '419e066b231c529533ff3ad76ddf6ce19baa98f169c2a088c4b78236aad4bb7b',
  cookieName: 'academy-session',
  cookieOptions: {
    secure: process.env['NODE_ENV'] === 'production',
  },
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    user?: User;
  }
}
