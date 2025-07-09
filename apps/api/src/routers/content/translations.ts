import { TranslationStatus, UserPermission, UserRole } from '@blms/constants';
import {
  adminContentManagementCourseSchema,
  availableCourseTranslationSchema,
  availableCourseTranslationWithAssignmentSchema,
  chapterTranslationDataSchema,
  courseLanguageInfoSchema,
  courseTranslationDetailsServiceResponseSchema,
  courseTranslationSlideSchema,
  courseTranslationStatusSchema,
  courseWithTodoTranslationsSchema,
  createTranslationInputSchema,
  getCourseTranslationChapterProgressInputSchema,
  getCourseTranslationSlidesInputSchema,
  updateCourseTranslationSlideInputSchema,
  updateTranslationStatusInputSchema,
} from '@blms/schemas';
import {
  createCreateCourseTranslation,
  createGetAdminContentManagementCourses,
  createGetAvailableCourseTranslations,
  createGetContentManagementTopics,
  createGetCourseLanguages,
  createGetCourseTranslationChapterProgress,
  createGetCourseTranslationDetails,
  createGetCourseTranslationSlides,
  createGetCourseTranslationStatus,
  createGetCourseTranslationUploads,
  createGetCoursesReadyForReview,
  createGetCoursesWithTodoTranslations,
  createGetReportsCourses,
  createGetTranslationProgress,
  createGetUserContributionsUnderReview,
  createGetUserCourseTranslations,
  createUpdateCourseTranslationSlide,
  createUpdateTranslationStatus,
} from '@blms/service-content';
import type {
  AdminContentManagementCourse,
  AvailableCourseTranslation,
  AvailableCourseTranslationWithAssignment,
  CourseLanguageInfo,
  CourseTranslationDetailsServiceResponse,
  CourseTranslationStatus,
  CourseWithTodoTranslations,
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
  .query(({ ctx, input }) => {
    return createGetCourseTranslationStatus(ctx.dependencies)(input);
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

    return createCreateCourseTranslation(ctx.dependencies)(input);
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

    return createUpdateTranslationStatus(ctx.dependencies)(input);
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
  .output<Parser<AvailableCourseTranslationWithAssignment[]>>(
    availableCourseTranslationWithAssignmentSchema.array(),
  )
  .query(({ ctx, input }) => {
    const userId = ctx.user?.uid;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    return createGetUserContributionsUnderReview(ctx.dependencies)(
      input.language,
      userId,
    );
  });

// Get translation progress for a language
const getTranslationProgressProcedure = publicProcedure
  .input(z.object({ language: z.string() }))
  .output<Parser<{ progress: number }>>(z.object({ progress: z.number() }))
  .query(({ ctx, input }) => {
    return createGetTranslationProgress(ctx.dependencies)(input.language).then(
      (progress: number) => ({ progress }),
    );
  });

// Check if uploads exist for a course
const hasCourseUploadsProcedure = publicProcedure
  .input(z.object({ courseId: z.string() }))
  .output(z.object({ exists: z.boolean() }))
  .query(({ ctx, input }) => {
    return createGetCourseTranslationUploads(ctx.dependencies)(
      input.courseId,
    ).then((rows) => ({ exists: rows.length > 0 }));
  });

// Admin content management endpoints
const getAdminContentManagementCoursesProcedure = adminProcedure
  .input(
    z.object({
      language: z.string().optional(),
      topic: z.string().optional(),
    }),
  )
  .output<Parser<AdminContentManagementCourse[]>>(
    adminContentManagementCourseSchema.array(),
  )
  .query(({ ctx, input }) => {
    return createGetAdminContentManagementCourses(ctx.dependencies)(
      input.language,
      input.topic,
    );
  });

// Reports courses endpoint - includes all courses for comprehensive reporting
const getReportsCoursesProcedure = adminProcedure
  .input(
    z.object({
      language: z.string().optional(),
      topic: z.string().optional(),
    }),
  )
  .output<Parser<AdminContentManagementCourse[]>>(
    adminContentManagementCourseSchema.array(),
  )
  .query(({ ctx, input }) => {
    return createGetReportsCourses(ctx.dependencies)(
      input.language,
      input.topic,
    );
  });

const getContentManagementTopicsProcedure = adminProcedure
  .output<Parser<string[]>>(z.array(z.string()))
  .query(({ ctx }) => {
    return createGetContentManagementTopics(ctx.dependencies)();
  });

const getCourseLanguagesProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .output<Parser<CourseLanguageInfo>>(courseLanguageInfoSchema)
  .query(({ ctx, input }) => {
    return createGetCourseLanguages(ctx.dependencies)({
      courseId: input.id,
    });
  });

const getCourseTranslationDetailsProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<CourseTranslationDetailsServiceResponse>>(
    courseTranslationDetailsServiceResponseSchema,
  )
  .query(({ ctx, input }) => {
    return createGetCourseTranslationDetails(ctx.dependencies)({
      courseId: input.id,
      language: input.language,
    });
  });

// Get courses with todo translations
const getCoursesWithTodoTranslationsProcedure = adminProcedure
  .output<Parser<CourseWithTodoTranslations[]>>(
    courseWithTodoTranslationsSchema.array(),
  )
  .query(({ ctx }) => {
    return createGetCoursesWithTodoTranslations(ctx.dependencies)();
  });

// Get course translation slides for a chapter
const getCourseTranslationSlidesProcedure = contributorProcedure
  .input(getCourseTranslationSlidesInputSchema)
  .output(chapterTranslationDataSchema)
  .query(({ ctx, input }) => {
    return createGetCourseTranslationSlides(ctx.dependencies)(input);
  });

// Update course translation slide
const updateCourseTranslationSlideProcedure = contributorProcedure
  .input(updateCourseTranslationSlideInputSchema)
  .output(courseTranslationSlideSchema)
  .mutation(({ ctx, input }) => {
    return createUpdateCourseTranslationSlide(ctx.dependencies)(input);
  });

// Get course translation chapter progress
const getCourseTranslationChapterProgressProcedure = contributorProcedure
  .input(getCourseTranslationChapterProgressInputSchema)
  .query(({ ctx, input }) => {
    return createGetCourseTranslationChapterProgress(ctx.dependencies)(input);
  });

export const translationsRouter = createTRPCRouter({
  getAvailableCourseTranslations: getAvailableCourseTranslationsProcedure,
  getUserCourseTranslations: getUserCourseTranslationsProcedure,
  getCourseTranslationStatus: getCourseTranslationStatusProcedure,
  createCourseTranslation: createCourseTranslationProcedure,
  updateTranslationStatus: updateTranslationStatusProcedure,
  getCoursesReadyForReview: getCoursesReadyForReviewProcedure,
  getUserContributionsUnderReview: getUserContributionsUnderReviewProcedure,
  getTranslationProgress: getTranslationProgressProcedure,
  hasCourseUploads: hasCourseUploadsProcedure,
  // Admin content management endpoints
  getAdminContentManagementCourses: getAdminContentManagementCoursesProcedure,
  getReportsCourses: getReportsCoursesProcedure,
  getContentManagementTopics: getContentManagementTopicsProcedure,
  getCourseDetails: getCourseTranslationDetailsProcedure,
  getCourseLanguages: getCourseLanguagesProcedure,
  getCoursesWithTodoTranslations: getCoursesWithTodoTranslationsProcedure,
  // Course translation slides endpoints
  getCourseTranslationSlides: getCourseTranslationSlidesProcedure,
  updateCourseTranslationSlide: updateCourseTranslationSlideProcedure,
  getCourseTranslationChapterProgress:
    getCourseTranslationChapterProgressProcedure,
});
