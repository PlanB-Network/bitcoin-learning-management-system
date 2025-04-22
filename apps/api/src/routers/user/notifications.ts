import { NotificationType } from '@blms/constants';
import {
  joinedUserNotificationSchema,
  scheduledCourseAnnouncementSchema,
} from '@blms/schemas';
import {
  createDeleteScheduledCourseAnnouncement,
  createGetScheduledCourseAnnouncements,
  createGetUserNotifications,
  createInsertScheduledCourseAnnouncement,
  createMarkUserNotificationsAsRead,
  createUpdateScheduledCourseAnnouncement,
} from '@blms/service-user';
import type {
  JoinedUserNotification,
  ScheduledCourseAnnouncement,
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

const getPublishedScheduledCourseAnnouncementsProcedure = studentProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<ScheduledCourseAnnouncement[]>>(
    scheduledCourseAnnouncementSchema.array(),
  )
  .query(({ ctx, input }) =>
    createGetScheduledCourseAnnouncements(ctx.dependencies)({
      courseId: input.courseId,
      isPublishedOnly: true,
    }),
  );

const getCourseAnnouncementsProcedure = professorProcedure
  .input(
    z.object({
      courseId: z.string(),
    }),
  )
  .output<Parser<ScheduledCourseAnnouncement[]>>(
    scheduledCourseAnnouncementSchema.array(),
  )
  .query(({ ctx, input }) =>
    createGetScheduledCourseAnnouncements(ctx.dependencies)({
      courseId: input.courseId,
      isPublishedOnly: false,
    }),
  );

const insertScheduledCourseAnnouncementProcedure = professorProcedure
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
    await createInsertScheduledCourseAnnouncement(ctx.dependencies)({
      type: input.type,
      content: input.content,
      scheduledAt: input.scheduledAt,
      timezone: input.timezone,
      studentGroup: input.studentGroup,
      courseId: input.courseId,
      uid: ctx.user.uid,
    });
  });

const updateScheduledCourseAnnouncementProcedure = professorProcedure
  .input(
    z.object({
      courseId: z.string(),
      type: z.nativeEnum(NotificationType),
      content: z.string(),
      studentGroup: z.enum(['all', 'summer', 'assignment']),
      scheduledAt: z.date(),
      timezone: z.string(),
      id: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createUpdateScheduledCourseAnnouncement(ctx.dependencies)({
      type: input.type,
      content: input.content,
      scheduledAt: input.scheduledAt,
      timezone: input.timezone,
      studentGroup: input.studentGroup,
      courseId: input.courseId,
      uid: ctx.user.uid,
      id: input.id,
    });
  });

const deleteScheduledCourseAnnouncementProcedure = professorProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createDeleteScheduledCourseAnnouncement(ctx.dependencies)({
      id: input.id,
    });
  });

export const userNotificationsRouter = createTRPCRouter({
  deleteScheduledCourseAnnouncement: deleteScheduledCourseAnnouncementProcedure,
  insertScheduledCourseAnnouncement: insertScheduledCourseAnnouncementProcedure,
  getCourseAnnouncement: getCourseAnnouncementsProcedure,
  getPublishedScheduledCourseAnnouncements:
    getPublishedScheduledCourseAnnouncementsProcedure,
  getUserNotifications: getUserNotificationsProcedure,
  markUserNotificationsAsRead: markUserNotificationsAsReadProcedure,
  updateScheduledCourseAnnouncement: updateScheduledCourseAnnouncementProcedure,
});
