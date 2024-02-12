import type { default as Account } from '../sql/users/Accounts.js';

export * from './courses.js';
export type { default as Account } from '../sql/users/Accounts.js';

export type UserDetails = Pick<
  Account,
  'uid' | 'username' | 'display_name' | 'email' | 'contributor_id'
>;
