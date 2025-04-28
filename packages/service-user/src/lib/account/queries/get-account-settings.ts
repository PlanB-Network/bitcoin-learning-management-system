import { sql } from '@blms/database';
import type { UserAccountSettings } from '@blms/types';

export const getUserAccountSettingsQuery = (uid: string) => {
  return sql<
    UserAccountSettings[]
  >`SELECT * FROM users.account_settings WHERE uid = ${uid}`;
};
