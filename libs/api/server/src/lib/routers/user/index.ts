import { z } from 'zod';

import {
  createChangePassword,
  createGetUserDetails,
} from '@sovereign-university/api/user';

import { protectedProcedure } from '../../procedures';
import { createTRPCRouter } from '../../trpc';
import { signAccessToken } from '../../utils/access-token';

import { userCoursesRouter } from './courses';

export const userRouter = createTRPCRouter({
  getMe: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      accessToken: signAccessToken(ctx.user.uid),
      isLoggedIn: true,
    };
  }),
  getDetails: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/users/details' } })
    .input(z.void())
    .output(z.any())
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
    .output(z.any())
    .mutation(async ({ ctx, input }) =>
      createChangePassword(ctx.dependencies)({
        uid: ctx.user.uid,
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      }),
    ),
  courses: userCoursesRouter,
});
