import type { Dependencies } from '../../../dependencies.js';
import { changeNotificationsSettingsQuery } from '../queries/change-notifications-settings.js';

interface Options {
  uid: string;
  platformNotifyEvents: boolean;
  platformNotifyCourses: boolean;
  platformNotifyGeneral: boolean;
  emailNotifyCourses: boolean;
  emailNotifyGeneral: boolean;
}

export const createChangeNotificationsSettings = ({
  postgres,
}: Dependencies) => {
  return async ({
    uid,
    platformNotifyEvents,
    platformNotifyCourses,
    platformNotifyGeneral,
    emailNotifyCourses,
    emailNotifyGeneral,
  }: Options) => {
    await postgres.exec(
      changeNotificationsSettingsQuery(
        uid,
        platformNotifyEvents,
        platformNotifyCourses,
        platformNotifyGeneral,
        emailNotifyCourses,
        emailNotifyGeneral,
      ),
    );
  };
};
