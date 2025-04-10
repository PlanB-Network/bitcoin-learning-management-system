import type { JoinedUserNotification } from '@blms/types';
import type { Dependencies } from '#src/dependencies.js';
import { getUserNotificationsQuery } from '../queries/get-user-notifications.js';

interface Options {
  uid: string;
}

export const createGetUserNotifications = ({ postgres }: Dependencies) => {
  return async ({ uid }: Options): Promise<JoinedUserNotification[] | null> => {
    const userNotifications = await postgres.exec(
      getUserNotificationsQuery(uid),
    );

    if (!userNotifications) {
      return null;
    }

    return userNotifications;
  };
};
