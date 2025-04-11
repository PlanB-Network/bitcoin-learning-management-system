import type { NotificationType } from '@blms/constants';
import type { Dependencies } from '#src/dependencies.js';
import { insertUserNotificationsQuery } from '../queries/insert-user-notifications.js';

interface Options {
  type: NotificationType;
  content: string;
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
    // NEED TO CHECK IF THE NOTIFICATION ALREADY EXISTS
    // NEED TO HANDLE TRANSLATIONS...

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
