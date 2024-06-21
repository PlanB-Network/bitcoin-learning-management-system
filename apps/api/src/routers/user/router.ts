import { z } from 'zod';

import {
  createChangeEmailConfirmation,
  createChangePassword,
  createEmailValidationToken,
  createGetUserDetails,
  createPasswordRecoveryToken,
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
    return {
      user: { uid: req.session.uid },
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
  billing: userBillingRouter,
  calendar: userCalendarRouter,
  courses: userCoursesRouter,
  events: userEventsRouter,
  webhooks: paymentWebhooksProcedure,
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
  requestPasswordRecovery: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ ctx, input }) =>
      createPasswordRecoveryToken(ctx.dependencies)(input.email),
    ),
});
