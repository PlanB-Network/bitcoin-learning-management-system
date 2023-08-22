import type { default as Account } from '../sql/users/Accounts';

export * from './courses';
export type { default as Account } from '../sql/users/Accounts';

export type UserDetails = Pick<
  Account,
  'uid' | 'username' | 'display_name' | 'email' | 'contributor_id'
>;
