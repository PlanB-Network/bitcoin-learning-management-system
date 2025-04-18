import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  usersNotifications,
  usersScheduledCourseNotifications,
  usersUserNotificationStatus,
} from '@blms/database';

import { NotificationType } from '@blms/constants';

export const notificationTypeSchema = z.nativeEnum(NotificationType);

export const notificationSchema = createSelectSchema(usersNotifications);
export const userNotificationStatusSchema = createSelectSchema(
  usersUserNotificationStatus,
);
export const scheduledCourseNotificationSchema = createSelectSchema(
  usersScheduledCourseNotifications,
);

export const joinedUserNotificationSchema = notificationSchema
  .pick({
    id: true,
    content: true,
    type: true,
    courseId: true,
    chapterId: true,
    eventId: true,
    blogId: true,
  })
  .merge(
    userNotificationStatusSchema.pick({
      createdAt: true,
      readDate: true,
    }),
  );
