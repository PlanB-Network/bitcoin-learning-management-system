import { TranslationStatus, UserPermission, UserRole } from '@blms/constants';
import { sql } from '@blms/database';
import {
  availableCourseTranslationSchema,
  availableCourseTranslationWithAssignmentSchema,
  courseTranslationStatusSchema,
  createTranslationInputSchema,
  updateTranslationStatusInputSchema,
} from '@blms/schemas';
import {
  createCheckUserTranslationAssignment,
  createCreateCourseTranslation,
  createGetAvailableCourseTranslations,
  createGetCourseTranslationStatus,
  createGetCoursesReadyForReview,
  createGetTranslationAssignmentRequests,
  createGetUserContributionsUnderReview,
  createGetUserCourseTranslations,
  createGetUserTranslationAssignments,
  createRequestTranslationAssignment,
  createUpdateTranslationAssignmentStatus,
  createUpdateTranslationStatus,
} from '@blms/service-content';
import type {
  AvailableCourseTranslation,
  CourseTranslationStatus,
} from '@blms/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  adminProcedure,
  contributorProcedure,
} from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

// Get all available course translations for a language
const getAvailableCourseTranslationsProcedure = publicProcedure
  .input(z.object({ language: z.string(), courseId: z.string() }))
  .output<Parser<AvailableCourseTranslation[]>>(
    availableCourseTranslationSchema.array(),
  )
  .query(({ ctx, input }) => {
    return createGetAvailableCourseTranslations(ctx.dependencies)(
      input.language,
      input.courseId,
    );
  });

// Get translations for a specific user
const getUserCourseTranslationsProcedure = contributorProcedure
  .input(z.object({ language: z.string() }))
  .output<Parser<AvailableCourseTranslation[]>>(
    availableCourseTranslationSchema.array(),
  )
  .query(({ ctx, input }) => {
    return createGetUserCourseTranslations(ctx.dependencies)(input.language);
  });

// Get translation status for a specific course
const getCourseTranslationStatusProcedure = publicProcedure
  .input(createTranslationInputSchema)
  .output<Parser<CourseTranslationStatus>>(courseTranslationStatusSchema)
  .query(async ({ ctx, input }) => {
    try {
      return await createGetCourseTranslationStatus(ctx.dependencies)(input);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching course translation status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch translation status',
      });
    }
  });

// Create a new translation for a course
const createCourseTranslationProcedure = contributorProcedure
  .input(createTranslationInputSchema)
  .output<Parser<AvailableCourseTranslation>>(availableCourseTranslationSchema)
  .mutation(async ({ ctx, input }) => {
    // Check if user has permission based on role and permissions
    const user = ctx.user;
    const hasPermission =
      user?.role === UserRole.Admin ||
      user?.role === UserRole.Superadmin ||
      ((user?.role === UserRole.Contributor ||
        user?.role === UserRole.Community) &&
        user?.permissions &&
        user.permissions.includes(UserPermission.ContributeAssign));

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to create translations',
      });
    }

    try {
      return await createCreateCourseTranslation(ctx.dependencies)(input);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error creating course translation:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create translation',
      });
    }
  });

// Update translation status
const updateTranslationStatusProcedure = contributorProcedure
  .input(updateTranslationStatusInputSchema)
  .output<Parser<AvailableCourseTranslation>>(availableCourseTranslationSchema)
  .mutation(async ({ ctx, input }) => {
    // Check if user has basic permission to update translations
    const user = ctx.user;
    const hasBasePermission =
      user?.role === UserRole.Admin ||
      user?.role === UserRole.Superadmin ||
      user?.role === UserRole.Contributor ||
      user?.role === UserRole.Community;

    if (!hasBasePermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update translation status',
      });
    }

    // Only admin or superadmin can publish
    if (
      input.status === TranslationStatus.Published &&
      user?.role !== UserRole.Admin &&
      user?.role !== UserRole.Superadmin
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can publish translations',
      });
    }

    try {
      return await createUpdateTranslationStatus(ctx.dependencies)(input);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating translation status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update translation status',
      });
    }
  });

// Get courses ready for review (for contribute app)
const getCoursesReadyForReviewProcedure = publicProcedure
  .input(z.object({ language: z.string() }))
  .output<Parser<AvailableCourseTranslation[]>>(
    availableCourseTranslationSchema.array(),
  )
  .query(({ ctx, input }) => {
    return createGetCoursesReadyForReview(ctx.dependencies)(input.language);
  });

// Get user's contributions under review (for contribute app)
const getUserContributionsUnderReviewProcedure = contributorProcedure
  .input(z.object({ language: z.string() }))
  .output<Parser<AvailableCourseTranslation[]>>(
    availableCourseTranslationWithAssignmentSchema.array(),
  )
  .query(async ({ ctx, input }) => {
    const userId = ctx.user?.uid;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      console.log('getUserContributionsUnderReview - Input:', {
        language: input.language,
        userId,
      });

      const result = await createGetUserContributionsUnderReview(
        ctx.dependencies,
      )(input.language, userId);

      console.log('getUserContributionsUnderReview - Result:', result);

      return result;
    } catch (error) {
      console.error('Error in getUserContributionsUnderReview:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user contributions',
        cause: error,
      });
    }
  });

// Request translation assignment
const requestTranslationAssignmentProcedure = contributorProcedure
  .input(z.object({ courseId: z.string(), language: z.string() }))
  .output(z.any()) // Temporary until we have the proper schema
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.uid;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      return await createRequestTranslationAssignment(ctx.dependencies)({
        courseId: input.courseId,
        language: input.language,
        userId,
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error requesting translation assignment:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to request translation assignment',
      });
    }
  });

// Get user's translation assignments
const getUserTranslationAssignmentsProcedure = contributorProcedure
  .input(
    z.object({
      language: z.string().optional(),
      status: z.string().optional(),
    }),
  )
  .output(z.any().array()) // Temporary until we have the proper schema
  .query(async ({ ctx, input }) => {
    const userId = ctx.user?.uid;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      return await createGetUserTranslationAssignments(ctx.dependencies)({
        userId,
        language: input.language,
        status: input.status,
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching user translation assignments:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch translation assignments',
      });
    }
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
  .output(z.any()) // Temporary until we have the proper schema
  .mutation(async ({ ctx, input }) => {
    try {
      return await createUpdateTranslationAssignmentStatus(ctx.dependencies)({
        assignmentId: input.assignmentId,
        status: input.status,
        rejectionReason: input.rejectionReason,
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating translation assignment status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update assignment status',
      });
    }
  });

// Get all translation assignment requests (for admins)
const getTranslationAssignmentRequestsProcedure = adminProcedure
  .input(z.object({ status: z.string().optional() }))
  .output(z.any().array()) // Temporary until we have the proper schema
  .query(async ({ ctx, input }) => {
    try {
      return await createGetTranslationAssignmentRequests(ctx.dependencies)(
        input.status,
      );
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching translation assignment requests:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch assignment requests',
      });
    }
  });

// Get translation progress for a language
const getTranslationProgressProcedure = publicProcedure
  .input(z.object({ language: z.string() }))
  .output<Parser<{ progress: number }>>(z.object({ progress: z.number() }))
  .query(async ({ ctx, input }) => {
    const { postgres } = ctx.dependencies;

    // Query to calculate translation progress
    const result = await postgres.exec(sql`
      WITH total_courses AS (
        SELECT COUNT(*) as total
        FROM content.courses c
        WHERE c.is_archived = false
      ),
      translated_courses AS (
        SELECT COUNT(*) as translated
        FROM content.course_translations ct
        JOIN content.courses c ON ct.course_id = c.id
        WHERE ct.language = LOWER(${input.language})
          AND ct.status = 'published'
          AND c.is_archived = false
      )
      SELECT
        CASE
          WHEN tc.total = 0 THEN 0
          ELSE ROUND((trc.translated::decimal / tc.total::decimal) * 100, 1)
        END as progress
      FROM total_courses tc, translated_courses trc
    `);

    const progress = result[0]?.progress || 0;
    return { progress };
  });

// Check if user has existing translation assignment
const checkUserTranslationAssignmentProcedure = contributorProcedure
  .input(z.object({ courseId: z.string(), language: z.string() }))
  .output(z.any().nullable()) // Temporary until we have the proper schema
  .query(async ({ ctx, input }) => {
    const userId = ctx.user?.uid;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      return await createCheckUserTranslationAssignment(ctx.dependencies)({
        userId,
        courseId: input.courseId,
        language: input.language,
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error checking user translation assignment:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check translation assignment',
      });
    }
  });

export const translationsRouter = createTRPCRouter({
  getAvailableCourseTranslations: getAvailableCourseTranslationsProcedure,
  getUserCourseTranslations: getUserCourseTranslationsProcedure,
  getCourseTranslationStatus: getCourseTranslationStatusProcedure,
  createCourseTranslation: createCourseTranslationProcedure,
  updateTranslationStatus: updateTranslationStatusProcedure,
  getCoursesReadyForReview: getCoursesReadyForReviewProcedure,
  getUserContributionsUnderReview: getUserContributionsUnderReviewProcedure,
  // Translation assignment endpoints
  requestTranslationAssignment: requestTranslationAssignmentProcedure,
  getUserTranslationAssignments: getUserTranslationAssignmentsProcedure,
  updateTranslationAssignmentStatus: updateTranslationAssignmentStatusProcedure,
  getTranslationAssignmentRequests: getTranslationAssignmentRequestsProcedure,
  // Translation progress endpoint
  getTranslationProgress: getTranslationProgressProcedure,
  // Check user assignment endpoint
  checkUserTranslationAssignment: checkUserTranslationAssignmentProcedure,
});
