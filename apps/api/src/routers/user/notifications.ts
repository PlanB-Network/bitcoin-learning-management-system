import { NotificationType } from '@blms/constants';
import {
  joinedUserNotificationSchema,
  scheduledCourseNotificationSchema,
} from '@blms/schemas';
import {
  createGetScheduledCourseNotifications,
  createGetUserNotifications,
  createInsertScheduledCourseNotification,
  createMarkUserNotificationsAsRead,
} from '@blms/service-user';
import type {
  JoinedUserNotification,
  ScheduledCourseNotification,
} from '@blms/types';
import { z } from 'zod';
import {
  professorProcedure,
  studentProcedure,
} from '#src/procedures/protected.js';
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

const getCourseNotificationsProcedure = professorProcedure
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
      isPublishedOnly: false,
    }),
  );

const insertScheduledCourseNotificationProcedure = professorProcedure
  .input(
    z.object({
      courseId: z.string(),
      type: z.nativeEnum(NotificationType),
      content: z.string(),
      studentGroup: z.enum(['all', 'summer', 'assignment']),
      scheduledAt: z.date(),
      timezone: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createInsertScheduledCourseNotification(ctx.dependencies)({
      type: input.type,
      content: input.content,
      scheduledAt: input.scheduledAt,
      timezone: input.timezone,
      studentGroup: input.studentGroup,
      courseId: input.courseId,
      uid: ctx.user.uid,
    });
  });

export const userNotificationsRouter = createTRPCRouter({
  insertScheduledCourseNotification: insertScheduledCourseNotificationProcedure,
  getCourseNotifications: getCourseNotificationsProcedure,
  getPublishedScheduledCourseNotifications:
    getPublishedScheduledCourseNotificationsProcedure,
  getUserNotifications: getUserNotificationsProcedure,
  markUserNotificationsAsRead: markUserNotificationsAsReadProcedure,
});
