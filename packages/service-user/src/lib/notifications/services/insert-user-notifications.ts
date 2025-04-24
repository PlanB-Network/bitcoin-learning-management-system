import type { NotificationType } from '@blms/constants';
import type { Dependencies } from '#src/dependencies.js';
import { getExistingNotificationsQuery } from '../queries/get-existing-notifications.js';
import { insertUserNotificationsAndStatusQuery } from '../queries/insert-user-notifications.js';

interface Options {
  type: NotificationType;
  content?: string;
  uids: string[];
  courseId?: string;
  chapterId?: string;
  eventId?: string;
  blogId?: string;
}

export const createInsertUserNotifications = ({ postgres }: Dependencies) => {
  return async ({
    uids,
    type,
    content,
    courseId,
    chapterId,
    eventId,
    blogId,
  }: Options) => {
    const existingNotification = await postgres.exec(
      getExistingNotificationsQuery(type, chapterId, eventId, blogId),
    );
    if (existingNotification.length > 0) {
      return;
    }

    await postgres.exec(
      insertUserNotificationsAndStatusQuery({
        uids,
        type,
        content,
        courseId,
        chapterId,
        eventId,
        blogId,
      }),
    );
  };
};
