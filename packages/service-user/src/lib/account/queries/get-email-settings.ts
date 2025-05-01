import { sql } from '@blms/database';
import type { EmailSettings } from '@blms/types';

export const getEmailSettingsQuery = (unsubscribeId: string) => {
  return sql<
    EmailSettings[]
  >`SELECT * FROM users.account_settings WHERE unsubscribe_id = ${unsubscribeId}`;
};
