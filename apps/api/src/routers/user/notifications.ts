import { NotificationType, StudentGroup } from '@blms/constants';
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
      notificationIds: input.notificationIds,
      uid: ctx.user.uid,
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
      isProfessor: true,
      isPublishedOnly: false,
    }),
  );

const insertScheduledCourseAnnouncementProcedure = professorProcedure
  .input(
    z.object({
      content: z.string(),
      courseId: z.string(),
      scheduledAt: z.date(),
      studentGroup: z.nativeEnum(StudentGroup),
      timezone: z.string(),
      type: z.nativeEnum(NotificationType),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createInsertScheduledCourseAnnouncement(ctx.dependencies)({
      content: input.content,
      courseId: input.courseId,
      scheduledAt: input.scheduledAt,
      studentGroup: input.studentGroup,
      timezone: input.timezone,
      type: input.type,
      uid: ctx.user.uid,
    });
  });

const updateScheduledCourseAnnouncementProcedure = professorProcedure
  .input(
    z.object({
      content: z.string(),
      courseId: z.string(),
      id: z.string(),
      scheduledAt: z.date(),
      studentGroup: z.nativeEnum(StudentGroup),
      timezone: z.string(),
      type: z.nativeEnum(NotificationType),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createUpdateScheduledCourseAnnouncement(ctx.dependencies)({
      content: input.content,
      courseId: input.courseId,
      id: input.id,
      scheduledAt: input.scheduledAt,
      studentGroup: input.studentGroup,
      timezone: input.timezone,
      type: input.type,
      uid: ctx.user.uid,
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
  getCourseAnnouncement: getCourseAnnouncementsProcedure,
  getPublishedScheduledCourseAnnouncements:
    getPublishedScheduledCourseAnnouncementsProcedure,
  getUserNotifications: getUserNotificationsProcedure,
  insertScheduledCourseAnnouncement: insertScheduledCourseAnnouncementProcedure,
  markUserNotificationsAsRead: markUserNotificationsAsReadProcedure,
  updateScheduledCourseAnnouncement: updateScheduledCourseAnnouncementProcedure,
});
