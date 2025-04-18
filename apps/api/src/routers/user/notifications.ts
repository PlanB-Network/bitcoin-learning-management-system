import {
  joinedUserNotificationSchema,
  scheduledCourseNotificationSchema,
} from '@blms/schemas';
import {
  createGetScheduledCourseNotifications,
  createGetUserNotifications,
  createMarkUserNotificationsAsRead,
} from '@blms/service-user';
import type {
  JoinedUserNotification,
  ScheduledCourseNotification,
} from '@blms/types';
import { z } from 'zod';
import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getUserNotificationsProcedure = studentProcedure
  .input(z.void())
  .output<Parser<JoinedUserNotification[]>>(
    joinedUserNotificationSchema.array(),
  )
  .query(({ ctx }) =>
    createGetUserNotifications(ctx.dependencies)({
      uid: ctx.user.uid,
    }),
  );

const markUserNotificationsAsReadProcedure = studentProcedure
  .input(
    z.object({
      notificationIds: z.array(z.string()),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createMarkUserNotificationsAsRead(ctx.dependencies)({
      uid: ctx.user.uid,
      notificationIds: input.notificationIds,
    });
  });

const getPublishedScheduledCourseNotificationsProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<ScheduledCourseNotification[]>>(
    scheduledCourseNotificationSchema.array(),
  )
  .query(({ ctx, input }) =>
    createGetScheduledCourseNotifications(ctx.dependencies)({
      courseId: input.courseId,
      isPublishedOnly: true,
    }),
  );

export const userNotificationsRouter = createTRPCRouter({
  getPublishedScheduledCourseNotifications:
    getPublishedScheduledCourseNotificationsProcedure,
  getUserNotifications: getUserNotificationsProcedure,
  markUserNotificationsAsRead: markUserNotificationsAsReadProcedure,
});
