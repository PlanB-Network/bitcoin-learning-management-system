import { NotificationType } from '@blms/constants';
import {
  usersNotifications,
  usersScheduledCourseNotifications,
  usersUserNotificationStatus,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const notificationTypeSchema = z.nativeEnum(NotificationType);

export const notificationSchema = createSelectSchema(usersNotifications);
export const userNotificationStatusSchema = createSelectSchema(
  usersUserNotificationStatus,
);
export const scheduledCourseAnnouncementSchema = createSelectSchema(
  usersScheduledCourseNotifications,
);

export const joinedUserNotificationSchema = notificationSchema
  .pick({
    blogId: true,
    chapterId: true,
    content: true,
    courseId: true,
    eventId: true,
    id: true,
    type: true,
  })
  .merge(
    userNotificationStatusSchema.pick({
      createdAt: true,
      readDate: true,
    }),
  );
