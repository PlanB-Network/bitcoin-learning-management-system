import { z } from 'zod';

import {
  createChangePassword,
  createGetUserDetails,
} from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

import { userCoursesRouter } from './courses.js';
import { paymentWebhooksProcedure } from './webhooks.js';

export const userRouter = createTRPCRouter({
  getMe: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      isLoggedIn: true,
    };
  }),
  getDetails: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/users/details' } })
    .input(z.void())

    .query(async ({ ctx }) =>
      createGetUserDetails(ctx.dependencies)({ uid: ctx.user.uid }),
    ),
  changePassword: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/users/change-password' } })
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
  webhooks: paymentWebhooksProcedure,
});
