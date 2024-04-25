import { z } from 'zod';

import {
  createChangePassword,
  createGetUserDetails,
} from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

import { userCoursesRouter } from './courses.js';
import { userEventsRouter } from './events.js';
import { paymentWebhooksProcedure } from './webhooks.js';

export const userRouter = createTRPCRouter({
  // TODO should be public procedure, not to have 401 when user is not logged in
  getSession: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      isLoggedIn: true,
    };
  }),
  getDetails: protectedProcedure
    .input(z.void())

    .query(async ({ ctx }) =>
      createGetUserDetails(ctx.dependencies)({ uid: ctx.user.uid }),
    ),
  changePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
      }),
    )

    .mutation(async ({ ctx, input }) =>
      createChangePassword(ctx.dependencies)({
        uid: ctx.user.uid,
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      }),
    ),
  courses: userCoursesRouter,
  events: userEventsRouter,
  webhooks: paymentWebhooksProcedure,
});
