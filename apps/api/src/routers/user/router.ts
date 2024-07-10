import { z } from 'zod';

import {
  createChangeDisplayName,
  createChangeEmailConfirmation,
  createChangePassword,
  createEmailValidationToken,
  createGetTokenInfo,
  createGetUserDetails,
  createPasswordReset,
  createPasswordResetToken,
} from '@sovereign-university/user';

import { protectedProcedure, publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

import { userBillingRouter } from './billing.js';
import { userCalendarRouter } from './calendar.js';
import { userCoursesRouter } from './courses.js';
import { userEventsRouter } from './events.js';
import { paymentWebhooksProcedure } from './webhooks.js';

export const userRouter = createTRPCRouter({
  // TODO should be public procedure, not to have 401 when user is not logged in
  getSession: publicProcedure.query(({ ctx }) => {
    const { req } = ctx;
    return req.session.uid
      ? {
          user: { uid: req.session.uid },
        }
      : null;
  }),
  getDetails: protectedProcedure
    .input(z.void())

    .query(({ ctx }) =>
      createGetUserDetails(ctx.dependencies)({ uid: ctx.user.uid }),
    ),
  changeDisplayName: protectedProcedure
    .input(
      z.object({
        displayName: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createChangeDisplayName(ctx.dependencies)({
        uid: ctx.user.uid,
        displayName: input.displayName,
      }),
    ),
  changePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
      }),
    )

    .mutation(({ ctx, input }) =>
      createChangePassword(ctx.dependencies)({
        uid: ctx.user.uid,
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      }),
    ),
  billing: userBillingRouter,
  calendar: userCalendarRouter,
  courses: userCoursesRouter,
  events: userEventsRouter,
  webhooks: paymentWebhooksProcedure,
  tokenInfo: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ ctx, input }) =>
      createGetTokenInfo(ctx.dependencies)(input.token),
    ),
  changeEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ ctx, input }) =>
      createEmailValidationToken(ctx.dependencies)(ctx.user.uid, input.email),
    ),
  validateEmailChange: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(({ ctx, input }) =>
      createChangeEmailConfirmation(ctx.dependencies)(input.token),
    ),
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ ctx, input }) =>
      createPasswordResetToken(ctx.dependencies)(input.email),
    ),
  resetPassword: publicProcedure
    .input(z.object({ resetToken: z.string(), newPassword: z.string() }))
    .mutation(({ ctx, input }) => {
      console.log('Reset Password', input);

      return createPasswordReset(ctx.dependencies)(
        input.resetToken,
        input.newPassword,
      );
    }),
});
