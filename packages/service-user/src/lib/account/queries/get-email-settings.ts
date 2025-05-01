import { sql } from '@blms/database';
import type { EmailSettings } from '@blms/types';

export const getEmailSettingsQuery = (unsubscribeId: string) => {
  return sql<EmailSettings[]>`SELECT email_notify_courses, email_notify_general
  FROM users.account_settings
  WHERE unsubscribe_id = ${unsubscribeId}`;
};
