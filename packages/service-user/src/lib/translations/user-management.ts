import { sql } from '@blms/database';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';

export interface ContributorDetails {
  uid: string;
  username: string | null;
  displayName: string | null;
  email: string;
  role: string;
  startDate: Date;
  assignedCourses: number;
  languages: string[];
}

export const createGetAvailableContributors = ({ postgres }: Dependencies) => {
  return async () => {
    try {
      const result = await postgres.exec(sql`
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
  };
};

/**
 * Service to get all users for admin management
 */
export const createGetAllUsers = ({ postgres }: Dependencies) => {
  return async () => {
    try {
      const result = await postgres.exec(sql`
        SELECT
          ua.uid,
          ua.username,
          ua.display_name AS "displayName",
          ua.email,
          ua.role,
          (
            SELECT COALESCE(ARRAY_AGG(DISTINCT language_code), ARRAY[]::text[])
            FROM users.reviewer_languages rl
            WHERE rl.reviewer_id = ua.uid
          ) AS "assignedLanguages"
        FROM users.accounts ua
        WHERE ua.role NOT IN ('admin', 'superadmin')
        ORDER BY ua.display_name, ua.username
      `);
      return result;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch all users',
      });
    }
  };
};

/**
 * Service to get admin user management data
 */
export const createGetAdminUserManagement = ({ postgres }: Dependencies) => {
  return async () => {
    try {
      const result = await postgres.exec(sql`
        SELECT
          ua.uid,
          ua.username,
          ua.display_name AS "displayName",
          ua.email,
          ua.role,
          ua.created_at AS "startDate",
          (
            SELECT COUNT(*)
            FROM users.translation_assignments ta
            WHERE ta.assignee_id = ua.uid
              AND ta.status IN ('assigned', 'in_progress', 'completed')
          ) AS "assignedCourses",
          (
            SELECT COALESCE(ARRAY_AGG(DISTINCT language_code), ARRAY[]::text[])
            FROM users.reviewer_languages rl
            WHERE rl.reviewer_id = ua.uid
          ) AS "languages"
        FROM users.accounts ua
        WHERE ua.role = 'contributor'
        ORDER BY ua.created_at DESC
      `);

      return result;
    } catch (error) {
      console.error('Error fetching admin user management data:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user management data',
      });
    }
  };
};

/**
 * Service to get detailed user information for translations
 */
export const createGetUserTranslationDetails = ({ postgres }: Dependencies) => {
  return async ({ userId }: { userId: string }) => {
    try {
      // Get detailed user information
      const userResult = await postgres.exec(sql`
        SELECT
          ua.uid,
          ua.username,
          ua.display_name AS "displayName",
          ua.email,
          ua.created_at AS "startDate",
          ua.role
        FROM users.accounts ua
        WHERE ua.uid = ${userId}
      `);

      if (userResult.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const user = userResult[0];

      // Get user's assignments with translation status
      const assignmentsResult = await postgres.exec(sql`
        SELECT
          ta.id,
          ta.course_id AS "courseId",
          ta.language,
          ta.status AS "assignmentStatus",
          ta.assigned_at AS "assignedAt",
          ta.completed_at AS "completedAt",
          c.index AS "courseIndex",
          cl.name AS "courseName",
          ct.status AS "translationStatus",
          ct.updated_at AS "translationUpdatedAt",
          COALESCE(
            ROUND(
              (COUNT(CASE WHEN ctc.status = 'reviewed' THEN 1 END)::numeric /
               NULLIF(COUNT(ctc.chapter_id), 0)::numeric) * 100, 0
            ), 0
          ) AS "progress"
        FROM users.translation_assignments ta
        JOIN content.courses c ON ta.course_id = c.id
        LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
        LEFT JOIN content.course_translations ct ON (
          ct.course_id = ta.course_id
          AND ct.language = ta.language
        )
        LEFT JOIN content.course_translation_chapters ctc ON (
          ctc.course_id = ta.course_id
          AND ctc.language = ta.language
        )
        WHERE ta.assignee_id = ${userId}
        GROUP BY
          ta.id, ta.course_id, ta.language, ta.status, ta.assigned_at, ta.completed_at,
          c.index, cl.name, ct.status, ct.updated_at
        ORDER BY ta.assigned_at DESC
      `);

      // Get user's languages
      const languagesResult = await postgres.exec(sql`
        SELECT language_code AS language
        FROM users.reviewer_languages
        WHERE reviewer_id = ${userId}
      `);

      return {
        ...user,
        assignments: assignmentsResult,
        languages: languagesResult.map((row: any) => row.language),
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching user details:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user details',
      });
    }
  };
};

/**
 * Service to assign course to contributor (move logic from translations router)
 */
export const createAssignCourseToContributor = ({ postgres }: Dependencies) => {
  return async ({
    courseId,
    language,
    assigneeId,
    assignerId,
  }: {
    courseId: string;
    language: string;
    assigneeId: string;
    assignerId: string;
  }) => {
    try {
      // Check if there's already an assignment for this course and language
      const existingAssignment = await postgres.exec(sql`
        SELECT id, status
        FROM users.translation_assignments
        WHERE course_id = ${courseId}
          AND language = LOWER(${language})
          AND status IN ('assigned', 'in_progress')
      `);

      if (existingAssignment.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Course is already assigned to another contributor',
        });
      }

      // Use proper transaction handling
      return await postgres.begin(async (transaction: any) => {
        // Create the assignment with 'assigned' status
        const result = await transaction`
          INSERT INTO users.translation_assignments (course_id, language, assignee_id, assigner_id, status)
          VALUES (${courseId}, LOWER(${language}), ${assigneeId}, ${assignerId}, 'assigned')
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
            ${courseId},
            LOWER(${language}),
            ch.part_id,
            ch.chapter_id,
            ${assigneeId},
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
      console.error('Error assigning course to contributor:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to assign course to contributor',
      });
    }
  };
};

/**
 * Service to reassign course to contributor
 */
export const createReassignCourseToContributor = ({
  postgres,
}: Dependencies) => {
  return async ({
    assignmentId,
    newAssigneeId,
    assignerId,
  }: {
    assignmentId: string;
    newAssigneeId: string;
    assignerId: string;
  }) => {
    try {
      return await postgres.begin(async (transaction: any) => {
        // Get the course and language from the assignment
        const assignmentInfo = await transaction`
          SELECT course_id, language
          FROM users.translation_assignments
          WHERE id = ${assignmentId}
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
            assignee_id = ${newAssigneeId},
            assigner_id = ${assignerId},
            status = 'assigned',
            assigned_at = NOW(),
            completed_at = NULL,
            rejection_reason = NULL
          WHERE id = ${assignmentId}
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
            ${newAssigneeId},
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
  };
};
