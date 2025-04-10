import { joinedUserNotificationSchema } from '@blms/schemas';
import {
  createGetUserNotifications,
  createMarkUserNotificationsAsRead,
} from '@blms/service-user';
import type { JoinedUserNotification } from '@blms/types';
import { z } from 'zod';
import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getUserNotificationsProcedure = studentProcedure
  .input(z.void())
  .output<Parser<JoinedUserNotification[] | null>>(
    joinedUserNotificationSchema.array().nullable(),
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

export const userNotificationsRouter = createTRPCRouter({
  getUserNotifications: getUserNotificationsProcedure,
  markUserNotificationsAsRead: markUserNotificationsAsReadProcedure,
});
