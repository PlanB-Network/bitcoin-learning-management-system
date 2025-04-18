import type { NotificationType } from '@blms/constants';
import type { Dependencies } from '#src/dependencies.js';
import { insertScheduledCourseNotificationQuery } from '../queries/insert-scheduled-course-notification.js';
import { publishScheduledCourseNotificationQuery } from '../queries/publish-scheduled-course-notification.js';

interface Options {
  type: NotificationType;
  content: string;
  scheduledAt: Date;
  timezone: string;
  studentGroup: 'all' | 'summer' | 'assignment';
  courseId: string;
  professorId: string;
}

export const createInsertScheduledCourseNotification = ({
  postgres,
}: Dependencies) => {
  return async (options: Options) => {
    const scheduledNotificationResult = await postgres.exec(
      insertScheduledCourseNotificationQuery(options),
    );

    if (
      !scheduledNotificationResult ||
      scheduledNotificationResult.length === 0 ||
      !scheduledNotificationResult[0].id
    ) {
      throw new Error('Failed to insert the scheduled course notification.');
    }

    return scheduledNotificationResult[0].id;
  };
};

export const createPublishScheduledCourseNotification = ({
  postgres,
}: Dependencies) => {
  return async ({
    scheduledNotificationId,
  }: {
    scheduledNotificationId: string;
  }) => {
    // TODO: handle getting users with specific group, right now we get every users enlisted in the course
    const result = await postgres.exec(
      publishScheduledCourseNotificationQuery({ scheduledNotificationId }),
    );

    if (result && result.length > 0) {
      return result[0];
    }

    return null;
  };
};
