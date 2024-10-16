import { z } from 'zod';

import { userRolesSchema } from '@blms/schemas';
import {
  createChangeCertificateName,
  createChangeDisplayName,
  createChangeEmailConfirmation,
  createChangePassword,
  createChangeRole,
  createChangeRoleToProfessor,
  createEmailValidationToken,
  createGetTokenInfo,
  createGetUserDetails,
  createGetUsersRoles,
  createPasswordReset,
  createPasswordResetToken,
} from '@blms/service-user';
import type { UserRoles } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import {
  adminProcedure,
  publicProcedure,
  studentProcedure,
  superadminProcedure,
} from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

import { userBCertificateRouter } from './bcertificate.js';
import { userBillingRouter } from './billing.js';
import { userCalendarRouter } from './calendar.js';
import { userCoursesRouter } from './courses.js';
import { userEventsRouter } from './events.js';
import { userTutorialsRouter } from './tutorials.js';
import { paymentWebhooksProcedure } from './webhooks.js';

export const userRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    const { req } = ctx;
    return req.session.uid
      ? {
          user: {
            uid: req.session.uid,
            role: req.session.role,
            professorId: req.session.professorId,
            professorCourses: req.session.professorCourses,
            professorTutorials: req.session.professorTutorials,
          },
        }
      : null;
  }),

  getDetails: studentProcedure
    .input(z.void())

    .query(({ ctx }) =>
      createGetUserDetails(ctx.dependencies)({ uid: ctx.user.uid }),
    ),

  getUsersRoles: adminProcedure
    .input(
      z.object({
        name: z.string(),
        role: z.string(),
      }),
    )
    .output<Parser<UserRoles[]>>(userRolesSchema.array())
    .query(({ ctx, input }) =>
      createGetUsersRoles(ctx.dependencies)({
        name: input.name,
        role: input.role,
      }),
    ),

  changeRoleToAdmin: superadminProcedure
    .input(
      z.object({
        uid: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangeRole(ctx.dependencies)({
        uid: input.uid,
        role: 'admin',
      }),
    ),

  changeRoleToProfessor: adminProcedure
    .input(
      z.object({
        uid: z.string(),
        professorId: z.number(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangeRoleToProfessor(ctx.dependencies)({
        uid: input.uid,
        role: 'professor',
        professorId: input.professorId,
      }),
    ),

  changeDisplayName: studentProcedure
    .input(
      z.object({
        displayName: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangeDisplayName(ctx.dependencies)({
        uid: ctx.user.uid,
        displayName: input.displayName,
      }),
    ),

  changeCertificateName: studentProcedure
    .input(
      z.object({
        certificateName: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangeCertificateName(ctx.dependencies)({
        uid: ctx.user.uid,
        certificateName: input.certificateName,
      }),
    ),

  changePassword: studentProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangePassword(ctx.dependencies)({
        uid: ctx.user.uid,
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      }),
    ),
  bcertificate: userBCertificateRouter,
  billing: userBillingRouter,
  calendar: userCalendarRouter,
  courses: userCoursesRouter,
  events: userEventsRouter,
  tutorials: userTutorialsRouter,
  webhooks: paymentWebhooksProcedure,
  tokenInfo: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ ctx, input }) =>
      createGetTokenInfo(ctx.dependencies)(input.token),
    ),
  changeEmail: studentProcedure
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
