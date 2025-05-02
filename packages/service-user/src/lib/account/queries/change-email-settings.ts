import { sql } from '@blms/database';

export const changeEmailSettingsQuery = (
  unsubscribeId: string,
  emailNotifyCourses: boolean,
  emailNotifyGeneral: boolean,
) => {
  return sql`
        UPDATE users.account_settings
        SET
        email_notify_courses = ${emailNotifyCourses},
        email_notify_general = ${emailNotifyGeneral}
        WHERE unsubscribe_id = ${unsubscribeId};
    `;
};
