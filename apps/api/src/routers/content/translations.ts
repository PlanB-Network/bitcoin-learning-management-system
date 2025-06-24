import { TranslationStatus, UserPermission, UserRole } from '@blms/constants';
import { sql } from '@blms/database';
import {
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
  .output(z.any().array())
  .query(({ ctx, input }) => {
    return createGetAvailableCourseTranslations(ctx.dependencies)(
      input.language,
      input.courseId,
    );
  });

// Get translations for a specific user
const getUserCourseTranslationsProcedure = contributorProcedure
  .input(z.object({ language: z.string() }))
  .output(z.any().array())
  .query(({ ctx, input }) => {
    return createGetUserCourseTranslations(ctx.dependencies)(input.language);
  });

// Get translation status for a specific course
const getCourseTranslationStatusProcedure = publicProcedure
  .input(createTranslationInputSchema)
  .output(z.any())
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
  .output(z.any())
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
  .output(z.any())
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
  .output(z.any().array())
  .query(({ ctx, input }) => {
    return createGetCoursesReadyForReview(ctx.dependencies)(input.language);
  });

// Get user's contributions under review (for contribute app)
const getUserContributionsUnderReviewProcedure = contributorProcedure
  .input(z.object({ language: z.string() }))
  .output(z.any().array())
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

// Admin content management endpoints
const getAdminContentManagementCoursesProcedure = adminProcedure
  .input(
    z.object({
      language: z.string().optional(),
      topic: z.string().optional(),
    }),
  )
  .output(z.array(z.any())) // Using z.any() temporarily
  .query(async ({ ctx, input }) => {
    try {
      // Direct SQL query for now
      let query = sql`
        SELECT
          ct.course_id AS "courseId",
          ct.language,
          CASE
            WHEN ta.status IS NOT NULL THEN 'assigned'
            ELSE 'not_assigned'
          END AS "status",
          ct.created_at AS "createdAt",
          ct.updated_at AS "updatedAt",
          c.index AS "courseIndex",
          c.topic AS "courseTopic",
          cl.name AS "courseName",
          ta.id AS "assignmentId",
          ta.assignee_id AS "assigneeId",
          ta.assigner_id AS "assignerId",
          ta.status AS "assignmentStatus",
          ta.assigned_at AS "assignedAt",
          ta.completed_at AS "completedAt",
          ua.username AS "assigneeUsername",
          ua.display_name AS "assigneeDisplayName",
          COALESCE(
            ROUND(
              (COUNT(CASE WHEN ctc.status = 'reviewed' THEN 1 END)::numeric /
               NULLIF(COUNT(ctc.chapter_id), 0)::numeric) * 100, 0
            ), 0
          ) AS "progress"
        FROM content.course_translations ct
        JOIN content.courses c ON ct.course_id = c.id
        LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
        LEFT JOIN users.translation_assignments ta ON (
          ta.course_id = ct.course_id
          AND ta.language = ct.language
        )
        LEFT JOIN users.accounts ua ON ta.assignee_id = ua.uid
        LEFT JOIN content.course_translation_chapters ctc ON (
          ctc.course_id = ct.course_id
          AND ctc.language = ct.language
        )
        WHERE ct.status IN ('ready_for_review', 'under_review')
          AND c.is_archived = false
      `;

      // Add language filter if provided
      if (input.language) {
        query = sql`${query} AND ct.language = LOWER(${input.language})`;
      }

      // Add topic filter if provided
      if (input.topic && input.topic !== 'all') {
        query = sql`${query} AND c.topic = ${input.topic}`;
      }

      query = sql`${query}
        GROUP BY
          ct.course_id, ct.language, ct.status, ct.created_at, ct.updated_at,
          c.index, c.topic, cl.name, ta.id, ta.assignee_id, ta.assigner_id, ta.status,
          ta.assigned_at, ta.completed_at, ua.username, ua.display_name
        ORDER BY
          CASE
            WHEN ta.status IS NULL THEN 0
            ELSE 1
          END,
          ct.updated_at DESC
      `;

      const result = await ctx.dependencies.postgres.exec(query);
      return result;
    } catch (error) {
      console.error('Error fetching admin content management courses:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch courses for content management',
      });
    }
  });

const getContentManagementTopicsProcedure = adminProcedure
  .output(z.array(z.string()))
  .query(async ({ ctx }) => {
    try {
      const result = await ctx.dependencies.postgres.exec(sql`
        SELECT DISTINCT c.topic
        FROM content.courses c
        JOIN content.course_translations ct ON c.id = ct.course_id
        WHERE ct.status IN ('ready_for_review', 'under_review')
          AND c.is_archived = false
          AND c.topic IS NOT NULL
        ORDER BY c.topic
      `);

      return result.map((row) => row.topic);
    } catch (error) {
      console.error('Error fetching content management topics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch topics for content management',
      });
    }
  });

const getAvailableContributorsProcedure = adminProcedure
  .output(z.array(z.any())) // Using z.any() temporarily
  .query(async ({ ctx }) => {
    try {
      // Direct SQL query for now
      const result = await ctx.dependencies.postgres.exec(sql`
        SELECT
          ua.uid,
          ua.username,
          ua.display_name AS "displayName",
          ua.email
        FROM users.accounts ua
        WHERE ua.role IN ('contributor', 'community')
        ORDER BY ua.display_name, ua.username
      `);
      return result;
    } catch (error) {
      console.error('Error fetching available contributors:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch available contributors',
      });
    }
  });

const assignCourseToContributorProcedure = adminProcedure
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      assigneeId: z.string(),
    }),
  )
  .output(z.any()) // Temporary until we have the proper schema
  .mutation(async ({ ctx, input }) => {
    const assignerId = ctx.user?.uid;
    if (!assignerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      // Check if there's already an assignment for this course and language
      const existingAssignment = await ctx.dependencies.postgres.exec(sql`
        SELECT id, status
        FROM users.translation_assignments
        WHERE course_id = ${input.courseId}
          AND language = LOWER(${input.language})
          AND status IN ('assigned', 'in_progress')
      `);

      if (existingAssignment.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Course is already assigned to another contributor',
        });
      }

      // Use proper transaction handling with the postgres library
      return await ctx.dependencies.postgres.begin(async (transaction) => {
        // Create the assignment with 'assigned' status
        const result = await transaction`
          INSERT INTO users.translation_assignments (course_id, language, assignee_id, assigner_id, status)
          VALUES (${input.courseId}, LOWER(${input.language}), ${input.assigneeId}, ${assignerId}, 'assigned')
          RETURNING
            id,
            course_id AS "courseId",
            language,
            assignee_id AS "assigneeId",
            assigner_id AS "assignerId",
            status,
            assigned_at AS "assignedAt",
            completed_at AS "completedAt",
            rejection_reason AS "rejectionReason"
        `;

        // Create chapter assignments for all chapters
        await transaction`
          INSERT INTO users.translation_chapter_assignments (course_id, language, part_id, chapter_id, assignee_id, assigner_id, status)
          SELECT
            ${input.courseId},
            LOWER(${input.language}),
            ch.part_id,
            ch.chapter_id,
            ${input.assigneeId},
            ${assignerId},
            'assigned'::assignment_status
          FROM content.course_chapters ch
          WHERE ch.course_id = ${input.courseId}
          ON CONFLICT (course_id, language, part_id, chapter_id, assignee_id) DO UPDATE SET
            assigner_id = EXCLUDED.assigner_id,
            assigned_at = NOW(),
            status = 'assigned'::assignment_status
        `;

        return result[0];
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error assigning course to contributor:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to assign course to contributor',
      });
    }
  });

const reassignCourseToContributorProcedure = adminProcedure
  .input(
    z.object({
      assignmentId: z.string(),
      newAssigneeId: z.string(),
    }),
  )
  .output(z.any()) // Temporary until we have the proper schema
  .mutation(async ({ ctx, input }) => {
    const assignerId = ctx.user?.uid;
    if (!assignerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      // Use proper transaction handling with the postgres library
      return await ctx.dependencies.postgres.begin(async (transaction) => {
        // Get the course and language from the assignment to update related tables
        const assignmentInfo = await transaction`
          SELECT course_id, language
          FROM users.translation_assignments
          WHERE id = ${input.assignmentId}
        `;

        if (assignmentInfo.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assignment not found',
          });
        }

        const { course_id: courseId, language } = assignmentInfo[0];

        // Update the existing assignment
        const result = await transaction`
          UPDATE users.translation_assignments
          SET
            assignee_id = ${input.newAssigneeId},
            assigner_id = ${assignerId},
            status = 'assigned',
            assigned_at = NOW(),
            completed_at = NULL,
            rejection_reason = NULL
          WHERE id = ${input.assignmentId}
          RETURNING
            id,
            course_id AS "courseId",
            language,
            assignee_id AS "assigneeId",
            assigner_id AS "assignerId",
            status,
            assigned_at AS "assignedAt",
            completed_at AS "completedAt",
            rejection_reason AS "rejectionReason"
        `;

        // Create/update chapter assignments for all chapters
        await transaction`
          INSERT INTO users.translation_chapter_assignments (course_id, language, part_id, chapter_id, assignee_id, assigner_id, status)
          SELECT
            ${courseId},
            LOWER(${language}),
            ch.part_id,
            ch.chapter_id,
            ${input.newAssigneeId},
            ${assignerId},
            'assigned'::assignment_status
          FROM content.course_chapters ch
          WHERE ch.course_id = ${courseId}
          ON CONFLICT (course_id, language, part_id, chapter_id, assignee_id) DO UPDATE SET
            assigner_id = EXCLUDED.assigner_id,
            assigned_at = NOW(),
            status = 'assigned'::assignment_status
        `;

        return result[0];
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error reassigning course to contributor:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reassign course to contributor',
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
  // Admin content management endpoints
  getAdminContentManagementCourses: getAdminContentManagementCoursesProcedure,
  getContentManagementTopics: getContentManagementTopicsProcedure,
  getAvailableContributors: getAvailableContributorsProcedure,
  assignCourseToContributor: assignCourseToContributorProcedure,
  reassignCourseToContributor: reassignCourseToContributorProcedure,
});
