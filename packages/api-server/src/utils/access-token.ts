import { sign } from 'jsonwebtoken';

import { JwtAuthTokenPayload } from '@sovereign-academy/types';

export const signAccessToken = (uid: string) => {
  const payload: JwtAuthTokenPayload = {
    uid,
  };

  return sign(payload, process.env['JWT_SECRET'] as string, {
    expiresIn: '12h',
  });
};
