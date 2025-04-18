import type { Dependencies } from '#src/dependencies.js';
import { getScheduledCourseNotificationsQuery } from '../queries/get-scheduled-course-notifications.js';

interface Options {
  courseId: string;
  isPublishedOnly?: boolean;
}

export const createGetScheduledCourseNotifications = ({
  postgres,
}: Dependencies) => {
  return async ({ courseId, isPublishedOnly = true }: Options) => {
    const announcements = await postgres.exec(
      getScheduledCourseNotificationsQuery({ courseId, isPublishedOnly }),
    );
    return announcements;
  };
};
