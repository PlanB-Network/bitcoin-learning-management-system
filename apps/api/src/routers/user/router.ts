import {
  GeneralPaymentItem,
  SortDirection,
  UserPermission,
  UserRole,
} from '@blms/constants';
import {
  checkoutDataSchema,
  emailSettingsSchema,
  generalPaymentLightSchema,
  userAccountSettingsSchema,
  userDetailsSchema,
  userRolesSchema,
} from '@blms/schemas';
import {
  createChangeCertificateName,
  createChangeDisplayName,
  createChangeEmailConfirmation,
  createChangeEmailSettings,
  createChangeNotificationsSettings,
  createChangePassword,
  createChangePermission,
  createChangeRole,
  createEmailValidationToken,
  createGetEmailSettings,
  createGetGeneralPayments,
  createGetTokenInfo,
  createGetUserAccountSettings,
  createGetUserDetails,
  createGetUsersRoles,
  createPasswordReset,
  createPasswordResetToken,
  createSaveGeneralPayment,
} from '@blms/service-user';
import type {
  CheckoutData,
  EmailSettings,
  GeneralPaymentLight,
  SessionData,
  UserAccountSettings,
  UserDetails,
  UserRoles,
} from '@blms/types';
import { z } from 'zod';
import {
  studentProcedure,
  superadminProcedure,
} from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';
import { userBCertRouter } from './bcert.js';
import { userBillingRouter } from './billing.js';
import { userCalendarRouter } from './calendar.js';
import { userCareerRouter } from './career.js';
import { userCoursesRouter } from './courses.js';
import { userEventsRouter } from './events.js';
import { userNotificationsRouter } from './notifications.js';
import { userTranslationRouter } from './translation.js';
import { userTutorialsRouter } from './tutorials.js';

export const userRouter = createTRPCRouter({
  bcert: userBCertRouter,
  billing: userBillingRouter,
  calendar: userCalendarRouter,
  career: userCareerRouter,
  translation: userTranslationRouter,

  changeCertificateName: studentProcedure
    .input(
      z.object({
        certificateName: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangeCertificateName(ctx.dependencies)({
        certificateName: input.certificateName,
        uid: ctx.user.uid,
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
        displayName: input.displayName,
        uid: ctx.user.uid,
      }),
    ),
  changeEmail: studentProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ ctx, input }) =>
      createEmailValidationToken(ctx.dependencies)(ctx.user.uid, input.email),
    ),

  changeEmailSettings: publicProcedure
    .input(
      z.object({
        emailNotifyCourses: z.boolean(),
        emailNotifyGeneral: z.boolean(),
        unsubscribeId: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangeEmailSettings(ctx.dependencies)({
        emailNotifyCourses: input.emailNotifyCourses,
        emailNotifyGeneral: input.emailNotifyGeneral,
        unsubscribeId: input.unsubscribeId,
      }),
    ),

  changeNotificationsSettings: studentProcedure
    .input(
      z.object({
        emailNotifyCourses: z.boolean(),
        emailNotifyGeneral: z.boolean(),
        platformNotifyCourses: z.boolean(),
        platformNotifyEvents: z.boolean(),
        platformNotifyGeneral: z.boolean(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangeNotificationsSettings(ctx.dependencies)({
        emailNotifyCourses: input.emailNotifyCourses,
        emailNotifyGeneral: input.emailNotifyGeneral,
        platformNotifyCourses: input.platformNotifyCourses,
        platformNotifyEvents: input.platformNotifyEvents,
        platformNotifyGeneral: input.platformNotifyGeneral,
        uid: ctx.user.uid,
      }),
    ),

  changePassword: studentProcedure
    .input(
      z.object({
        newPassword: z.string(),
        oldPassword: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangePassword(ctx.dependencies)({
        newPassword: input.newPassword,
        oldPassword: input.oldPassword,
        uid: ctx.user.uid,
      }),
    ),

  changePermission: superadminProcedure
    .input(
      z.object({
        permissions: z.nativeEnum(UserPermission).array(),
        uid: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangePermission(ctx.dependencies)({
        permissions: input.permissions,
        uid: input.uid,
      }),
    ),

  changeRole: superadminProcedure
    .input(
      z.object({
        professorId: z.string().nullable(),
        role: z.nativeEnum(UserRole).optional(),
        uid: z.string(),
      }),
    )
    .output<Parser<void>>(z.void())
    .mutation(({ ctx, input }) =>
      createChangeRole(ctx.dependencies)({
        professorId: input.professorId,
        role: input.role ?? UserRole.Professor,
        uid: input.uid,
      }),
    ),
  courses: userCoursesRouter,
  events: userEventsRouter,

  getAccountSettings: studentProcedure
    .input(z.void())
    .output<Parser<UserAccountSettings | null>>(
      userAccountSettingsSchema.nullable(),
    )
    .query(({ ctx }) =>
      createGetUserAccountSettings(ctx.dependencies)({
        uid: ctx.user.uid,
      }),
    ),

  getDetails: studentProcedure
    .input(z.void())
    .output<Parser<UserDetails | null>>(userDetailsSchema.nullable())
    .query(({ ctx }) => {
      return createGetUserDetails(ctx.dependencies)({
        uid: ctx.req.session.uid!,
      });
    }),

  getEmailSettings: publicProcedure
    .input(
      z.object({
        unsubscribeId: z.string(),
      }),
    )
    .output<Parser<EmailSettings | null>>(emailSettingsSchema.nullable())
    .query(({ ctx, input }) =>
      createGetEmailSettings(ctx.dependencies)({
        unsubscribeId: input.unsubscribeId,
      }),
    ),

  getGeneralPaymentsProcedure: studentProcedure
    .input(z.void())
    .output<Parser<GeneralPaymentLight[]>>(generalPaymentLightSchema.array())
    .query(({ ctx }) =>
      createGetGeneralPayments(ctx.dependencies)({ uid: ctx.user.uid }),
    ),
  getSession: publicProcedure.query(({ ctx }): SessionData | null => {
    const session = ctx.req.session;
    if (!session || !session.uid || !session.role) {
      return null;
    }

    return {
      permissions: session.permissions ?? null,
      role: session.role,
      uid: session.uid,
    };
  }),

  getUsersRoles: superadminProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number(),
        name: z.string(),
        orderDirection: z
          .nativeEnum(SortDirection)
          .optional()
          .default(SortDirection.Asc),
        orderField: z
          .enum(['displayName', 'username', 'role'])
          .optional()
          .default('username'),
        role: z.string().optional(),
      }),
    )
    .output<Parser<{ users: UserRoles[]; nextCursor: string | null }>>(
      z.object({
        nextCursor: z.string().nullable(),
        users: userRolesSchema.array(),
      }),
    )
    .query(({ ctx, input }) =>
      createGetUsersRoles(ctx.dependencies)({
        cursor: input.cursor,
        limit: input.limit,
        name: input.name,
        orderDirection: input.orderDirection,
        orderField: input.orderField,
        role: input.role,
      }),
    ),
  notifications: userNotificationsRouter,
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ ctx, input }) =>
      createPasswordResetToken(ctx.dependencies)(input.email),
    ),

  resetPassword: publicProcedure
    .input(z.object({ newPassword: z.string(), resetToken: z.string() }))
    .mutation(({ ctx, input }) => {
      return createPasswordReset(ctx.dependencies)(
        input.resetToken,
        input.newPassword,
      );
    }),
  saveGeneralPayment: studentProcedure
    .input(
      z.object({
        couponCode: z.string().optional(),
        dollarPrice: z.number(),
        item: z.nativeEnum(GeneralPaymentItem),
        method: z.string(),
        satsPrice: z.number(),
      }),
    )
    .output<Parser<CheckoutData>>(checkoutDataSchema)
    .mutation(({ ctx, input }) =>
      createSaveGeneralPayment(ctx.dependencies)({
        couponCode: input.couponCode,
        dollarPrice: input.dollarPrice,
        item: input.item,
        method: input.method,
        satsPrice: input.satsPrice,
        uid: ctx.user.uid,
      }),
    ),
  tokenInfo: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ ctx, input }) =>
      createGetTokenInfo(ctx.dependencies)(input.token),
    ),
  tutorials: userTutorialsRouter,
  validateEmailChange: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(({ ctx, input }) =>
      createChangeEmailConfirmation(ctx.dependencies)(input.token),
    ),
});
