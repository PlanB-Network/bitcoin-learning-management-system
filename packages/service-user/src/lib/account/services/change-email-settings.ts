import type { Dependencies } from '../../../dependencies.js';
import { changeEmailSettingsQuery } from '../queries/change-email-settings.js';
import {} from '../queries/change-notifications-settings.js';

interface Options {
  unsubscribeId: string;
  emailNotifyCourses: boolean;
  emailNotifyGeneral: boolean;
}

export const createChangeEmailSettings = ({ postgres }: Dependencies) => {
  return async ({
    unsubscribeId,
    emailNotifyCourses,
    emailNotifyGeneral,
  }: Options) => {
    await postgres.exec(
      changeEmailSettingsQuery(
        unsubscribeId,
        emailNotifyCourses,
        emailNotifyGeneral,
      ),
    );
  };
};
