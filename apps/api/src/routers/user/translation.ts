import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  adminProcedure,
  contributorProcedure,
} from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

import type {
  AdminUserManagement,
  AllUsers,
  AvailableContributor,
  ServiceTranslationAssignment,
  UserTranslationDetailsServiceResponse,
} from '@blms/types';

import {
  adminUserManagementSchema,
  allUsersSchema,
  availableContributorSchema,
  serviceTranslationAssignmentSchema,
  userTranslationDetailsServiceResponseSchema,
} from '@blms/schemas';

import {
  createAssignCourseToContributor,
  createAssignLanguageToContributor,
  createCheckUserTranslationAssignment,
  createGetAdminUserManagement,
  createGetAllUsers,
  createGetAvailableContributors,
  createGetAvailableLanguages,
  createGetTranslationAssignmentRequests,
  createGetUserTranslationAssignments,
  createReassignCourseToContributor,
  createRequestTranslationAssignment,
  createUpdateTranslationAssignmentStatus,
} from '@blms/service-user';

// Request translation assignment
const requestTranslationAssignmentProcedure = contributorProcedure
  .input(z.object({ courseId: z.string(), language: z.string() }))
  .output<Parser<ServiceTranslationAssignment>>(
    serviceTranslationAssignmentSchema,
  )
  .mutation(({ ctx, input }) => {
    const userId = ctx.user?.uid;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    return createRequestTranslationAssignment(ctx.dependencies)({
      courseId: input.courseId,
      language: input.language,
      userId,
    });
  });

// Get user's translation assignments
const getUserTranslationAssignmentsProcedure = contributorProcedure
  .input(
    z.object({
      language: z.string().optional(),
      status: z.string().optional(),
    }),
  )
  .output<Parser<ServiceTranslationAssignment[]>>(
    serviceTranslationAssignmentSchema.array(),
  )
  .query(async ({ ctx, input }) => {
    const userId = ctx.user?.uid;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    return createGetUserTranslationAssignments(ctx.dependencies)({
      userId,
      language: input.language,
      status: input.status,
    });
  });

// Update translation assignment status
const updateTranslationAssignmentStatusProcedure = adminProcedure
  .input(
    z.object({
      assignmentId: z.string(),
      status: z.string(),
      rejectionReason: z.string().optional(),
    }),
  )
  .output<Parser<ServiceTranslationAssignment>>(
    serviceTranslationAssignmentSchema,
  )
  .mutation(({ ctx, input }) => {
    return createUpdateTranslationAssignmentStatus(ctx.dependencies)({
      assignmentId: input.assignmentId,
      status: input.status,
      rejectionReason: input.rejectionReason,
    });
  });

// Get all translation assignment requests (for admins)
const getTranslationAssignmentRequestsProcedure = adminProcedure
  .input(z.object({ status: z.string().optional() }))
  .output<Parser<ServiceTranslationAssignment[]>>(
    serviceTranslationAssignmentSchema.array(),
  )
  .query(async ({ ctx, input }) => {
    return createGetTranslationAssignmentRequests(ctx.dependencies)(
      input.status,
    );
  });

// Check if user has existing translation assignment
const checkUserTranslationAssignmentProcedure = contributorProcedure
  .input(z.object({ courseId: z.string(), language: z.string() }))
  .output<Parser<ServiceTranslationAssignment | null>>(
    serviceTranslationAssignmentSchema.nullable(),
  )
  .query(({ ctx, input }) => {
    const userId = ctx.user?.uid;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    return createCheckUserTranslationAssignment(ctx.dependencies)({
      userId,
      courseId: input.courseId,
      language: input.language,
    });
  });

// Get available contributors for assignment
const getAvailableContributorsProcedure = adminProcedure
  .output<Parser<AvailableContributor[]>>(z.array(availableContributorSchema))
  .query(({ ctx }) => {
    return createGetAvailableContributors(ctx.dependencies)();
  });

// Get all users (for admin)
const getAllUsersProcedure = adminProcedure
  .output<Parser<AllUsers[]>>(z.array(allUsersSchema))
  .query(({ ctx }) => {
    return createGetAllUsers(ctx.dependencies)();
  });

// Assign course to contributor
const assignCourseToContributorProcedure = adminProcedure
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      assigneeId: z.string(),
    }),
  )
  .output<Parser<ServiceTranslationAssignment>>(
    serviceTranslationAssignmentSchema,
  )
  .mutation(async ({ ctx, input }) => {
    const assignerId = ctx.user?.uid;
    if (!assignerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    return createAssignCourseToContributor(ctx.dependencies)({
      courseId: input.courseId,
      language: input.language,
      assigneeId: input.assigneeId,
      assignerId,
    });
  });

// Reassign course to different contributor
const reassignCourseToContributorProcedure = adminProcedure
  .input(
    z.object({
      assignmentId: z.string(),
      newAssigneeId: z.string(),
    }),
  )
  .output<Parser<ServiceTranslationAssignment>>(
    serviceTranslationAssignmentSchema,
  )
  .mutation(async ({ ctx, input }) => {
    const assignerId = ctx.user?.uid;
    if (!assignerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    return createReassignCourseToContributor(ctx.dependencies)({
      assignmentId: input.assignmentId,
      newAssigneeId: input.newAssigneeId,
      assignerId,
    });
  });

// Admin user management endpoints
const getAdminUserManagementProcedure = adminProcedure
  .output<Parser<AdminUserManagement[]>>(z.array(adminUserManagementSchema))
  .query(({ ctx }) => {
    return createGetAdminUserManagement(ctx.dependencies)();
  });

// Get user details for admin
const getUserDetailsProcedure = adminProcedure
  .input(z.object({ userId: z.string() }))
  .output<Parser<UserTranslationDetailsServiceResponse>>(
    userTranslationDetailsServiceResponseSchema,
  )
  .query(async ({ ctx, input }) => {
    const result = await createGetUserTranslationDetails(ctx.dependencies)({
      userId: input.userId,
    });
    return result as UserTranslationDetailsServiceResponse;
  });

// Assign language to contributor
const assignLanguageToContributorProcedure = adminProcedure
  .input(
    z.object({
      contributorId: z.string(),
      languageCode: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) => {
    return createAssignLanguageToContributor(ctx.dependencies)({
      contributorId: input.contributorId,
      languageCode: input.languageCode,
    });
  });

// Get available languages
const getAvailableLanguagesProcedure = publicProcedure
  .output<Parser<{ code: string; name: string }[]>>(
    z.array(z.object({ code: z.string(), name: z.string() })),
  )
  .query(({ ctx }) => {
    return createGetAvailableLanguages(ctx.dependencies)();
  });

export const userTranslationRouter = createTRPCRouter({
  // Translation assignment endpoints
  requestTranslationAssignment: requestTranslationAssignmentProcedure,
  getUserTranslationAssignments: getUserTranslationAssignmentsProcedure,
  updateTranslationAssignmentStatus: updateTranslationAssignmentStatusProcedure,
  getTranslationAssignmentRequests: getTranslationAssignmentRequestsProcedure,
  checkUserTranslationAssignment: checkUserTranslationAssignmentProcedure,
  // User management endpoints
  getAvailableContributors: getAvailableContributorsProcedure,
  getAllUsers: getAllUsersProcedure,
  assignCourseToContributor: assignCourseToContributorProcedure,
  reassignCourseToContributor: reassignCourseToContributorProcedure,
  getAdminUserManagement: getAdminUserManagementProcedure,
  getUserDetails: getUserDetailsProcedure,
  assignLanguageToContributor: assignLanguageToContributorProcedure,
  getAvailableLanguages: getAvailableLanguagesProcedure,
});
