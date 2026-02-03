import { firstRow } from '@blms/database';
import type { UserAccount, UserDetails } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import {
  getUserByIdWithDetailsQuery,
  getUserByLud4PublicKey,
  getUserByUserNameOrEmailQuery,
  getUserByUserNameQuery,
  getUserUidByCalendarTokenQuery,
  getUserVerifiedEmailQuery,
} from '../queries/get-user.js';

export const createGetUserDetails = ({ postgres }: Dependencies) => {
  return ({ uid }: { uid: string }): Promise<UserDetails | null> => {
    return postgres
      .exec(getUserByIdWithDetailsQuery(uid))
      .then(firstRow)
      .then((user) => user ?? null);
  };
};

export const createGetUserByUsername = ({ postgres }: Dependencies) => {
  return ({ username }: { username: string }): Promise<UserAccount | null> => {
    return postgres
      .exec(getUserByUserNameQuery(username))
      .then(firstRow)
      .then((user) => user ?? null);
  };
};

export const createGetUserByUsernameOrEmail = ({ postgres }: Dependencies) => {
  return (usernameOrEmail: string): Promise<UserAccount | null> => {
    return postgres
      .exec(getUserByUserNameOrEmailQuery(usernameOrEmail))
      .then(firstRow)
      .then((user) => user ?? null);
  };
};

export const createGetUserByLud4PublicKey = ({ postgres }: Dependencies) => {
  return ({ key }: { key: string }): Promise<UserAccount | null> => {
    return postgres
      .exec(getUserByLud4PublicKey(key))
      .then(firstRow)
      .then((user) => user ?? null);
  };
};
export const createGetUserUidByCalendarToken = ({ postgres }: Dependencies) => {
  return ({ token }: { token: string }): Promise<{ uid: string } | null> => {
    return postgres
      .exec(getUserUidByCalendarTokenQuery(token))
      .then(firstRow)
      .then((user) => user ?? null);
  };
};

export const createGetUserVerifiedEmail = ({ postgres }: Dependencies) => {
  return async (uid: string): Promise<string> => {
    return postgres
      .exec(getUserVerifiedEmailQuery(uid))
      .then(firstRow)
      .then((row) => row?.email || '');
  };
};
