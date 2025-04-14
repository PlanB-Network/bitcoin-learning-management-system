import type { Dependencies } from '#src/dependencies.js';
import { markUserNotificationsAsReadQuery } from '../queries/mark-user-notifications-as-read.js';

interface Options {
  uid: string;
  notificationIds: string[];
}

export const createMarkUserNotificationsAsRead = ({
  postgres,
}: Dependencies) => {
  return async ({ uid, notificationIds }: Options) => {
    await postgres.exec(
      markUserNotificationsAsReadQuery({
        notificationIds: notificationIds,
        uid: uid,
      }),
    );
  };
};
