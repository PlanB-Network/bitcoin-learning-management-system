import { sign } from 'jsonwebtoken';

import { JwtAuthTokenPayload } from '@sovereign-academy/types';

export const signAccessToken = (user: {
  username: string;
  email?: string | null;
}) => {
  const payload: JwtAuthTokenPayload = {
    username: user.username,
    email: user.email || undefined,
  };

  return sign(payload, process.env['JWT_SECRET'] as string, {
    expiresIn: '12h',
  });
};
