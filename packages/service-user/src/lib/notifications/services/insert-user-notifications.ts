import type { NotificationType } from '@blms/constants';
import type { Dependencies } from '#src/dependencies.js';
import { getExistingNotificationsQuery } from '../queries/get-existing-notifications.js';
import { insertUserNotificationsQuery } from '../queries/insert-user-notifications.js';

interface Options {
  type: NotificationType;
  content?: string;
  uids: string[];
  courseId?: string;
  chapterId?: string;
  eventId?: string;
}

export const createInsertUserNotifications = ({ postgres }: Dependencies) => {
  return async ({
    uids,
    type,
    content,
    courseId,
    chapterId,
    eventId,
  }: Options) => {
    const existingNotification = await postgres.exec(
      getExistingNotificationsQuery(type, chapterId, eventId),
    );
    if (existingNotification.length > 0) {
      return;
    }

    await postgres.exec(
      insertUserNotificationsQuery({
        uids,
        type,
        content,
        courseId,
        chapterId,
        eventId,
      }),
    );
  };
};
