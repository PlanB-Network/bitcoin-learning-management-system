import { sql } from '@blms/database';

export const changeNotificationsSettingsQuery = (
  uid: string,
  platformNotifyEvents: boolean,
  platformNotifyCourses: boolean,
  platformNotifyGeneral: boolean,
  emailNotifyCourses: boolean,
  emailNotifyGeneral: boolean,
) => {
  return sql`
        UPDATE users.account_settings
        SET
        platform_notify_events = ${platformNotifyEvents},
        platform_notify_courses = ${platformNotifyCourses},
        platform_notify_general = ${platformNotifyGeneral},
        email_notify_courses = ${emailNotifyCourses},
        email_notify_general = ${emailNotifyGeneral}
        WHERE uid = ${uid};
    `;
};
