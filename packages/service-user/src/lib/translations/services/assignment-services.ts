import type { AssignmentStatus } from '@blms/constants';
import { sql } from '@blms/database';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../../dependencies.js';
import {
  getTranslationAssignmentRequestsQuery,
  getUserTranslationAssignmentsQuery,
} from '../queries/assignment-queries.js';

export interface TranslationAssignment {
  id: string;
  courseId: string;
  language: string;
  assigneeId: string;
  assignerId: string;
  status: AssignmentStatus;
  assignedAt: Date;
  completedAt: Date | null;
  rejectionReason: string | null;
  index?: string;
  courseName?: string;
  assigneeUsername?: string;
  assignerUsername?: string;
}

/**
 * Service to create a translation assignment request
 */
export const createRequestTranslationAssignment = ({
  postgres,
}: Dependencies) => {
  return async ({
    courseId,
    language,
    userId,
  }: {
    courseId: string;
    language: string;
    userId: string;
  }): Promise<TranslationAssignment> => {
    try {
      return await postgres.begin(async (transaction) => {
        // Check if user already has an assignment for this course-language combination
        const existingAssignment = await transaction<{ id: string }[]>`
          SELECT id
          FROM users.translation_assignments
          WHERE course_id = ${courseId}
            AND language = LOWER(${language})
            AND assignee_id = ${userId}
          LIMIT 1
        `;

        if (existingAssignment.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message:
              'You already have an assignment for this course and language',
          });
        }

        // Check if course translation exists, if not create it
        const existingTranslation = await transaction`
          SELECT course_id, language
          FROM content.course_translations
          WHERE course_id = ${courseId} AND language = LOWER(${language})
        `;

        if (existingTranslation.length === 0) {
          // Create the course translation entry
          await transaction`
            INSERT INTO content.course_translations (course_id, language, status)
            VALUES (${courseId}, LOWER(${language}), 'todo'::translation_status)
          `;

          // Populate course_translation_chapters
          await transaction`
            INSERT INTO content.course_translation_chapters (course_id, language, part_id, chapter_id, status, created_at, updated_at)
            SELECT
              ${courseId},
              ${language.toLowerCase()},
              cc.part_id,
              cc.chapter_id,
              'todo'::translation_status,
              NOW(),
              NOW()
            FROM content.course_chapters cc
            WHERE cc.course_id = ${courseId}
            ON CONFLICT (course_id, language, part_id, chapter_id) DO NOTHING
          `;
        }

        // Create the assignment request
        const results = await transaction<TranslationAssignment[]>`
          INSERT INTO users.translation_assignments (course_id, language, assignee_id, assigner_id, status)
          VALUES (${courseId}, LOWER(${language}), ${userId}, ${userId}, 'requested')
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

        if (results.length === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create translation assignment request',
          });
        }

        return results[0];
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create translation assignment request',
      });
    }
  };
};

/**
 * Service to get user's translation assignments
 */
export const createGetUserTranslationAssignments = ({
  postgres,
}: Dependencies) => {
  return async ({
    userId,
    language,
    status,
  }: {
    userId: string;
    language?: string;
    status?: string;
  }): Promise<TranslationAssignment[]> => {
    try {
      const results = await postgres.exec(
        getUserTranslationAssignmentsQuery(userId, language, status),
      );

      return results as TranslationAssignment[];
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user translation assignments',
      });
    }
  };
};

/**
 * Service to update translation assignment status
 */
export const createUpdateTranslationAssignmentStatus = ({
  postgres,
}: Dependencies) => {
  return async ({
    assignmentId,
    status,
    rejectionReason,
  }: {
    assignmentId: string;
    status: string;
    rejectionReason?: string;
  }): Promise<TranslationAssignment> => {
    try {
      return await postgres.begin(async (transaction) => {
        // Retrieve assignment details
        const assignmentDetails = await transaction`
          SELECT course_id, language, assignee_id, assigner_id
          FROM users.translation_assignments
          WHERE id = ${assignmentId}
        `;

        if (assignmentDetails.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Translation assignment not found',
          });
        }

        // Update assignment status
        const results = await transaction`
          UPDATE users.translation_assignments
          SET
            status = ${status},
            completed_at = ${status === 'completed' ? sql`NOW()` : sql`NULL`},
            rejection_reason = ${rejectionReason || null}
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

        return results[0] as TranslationAssignment;
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update translation assignment status',
      });
    }
  };
};

/**
 * Service to check if user has an existing translation assignment for a course
 */
export const createCheckUserTranslationAssignment = ({
  postgres,
}: Dependencies) => {
  return async ({
    userId,
    courseId,
    language,
  }: {
    userId: string;
    courseId: string;
    language: string;
  }): Promise<TranslationAssignment | null> => {
    try {
      const results = await postgres.exec(sql`
        SELECT
          ta.id,
          ta.course_id AS "courseId",
          ta.language,
          ta.assignee_id AS "assigneeId",
          ta.assigner_id AS "assignerId",
          ta.status,
          ta.assigned_at AS "assignedAt",
          ta.completed_at AS "completedAt",
          ta.rejection_reason AS "rejectionReason"
        FROM users.translation_assignments ta
        WHERE ta.assignee_id = ${userId}
          AND ta.course_id = ${courseId}
          AND ta.language = LOWER(${language})
        ORDER BY ta.assigned_at DESC
        LIMIT 1
      `);

      return results.length > 0 ? (results[0] as TranslationAssignment) : null;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check user translation assignment',
      });
    }
  };
};

/**
 * Service to get all translation assignment requests (for admins)
 */
export const createGetTranslationAssignmentRequests = ({
  postgres,
}: Dependencies) => {
  return async (status?: string): Promise<TranslationAssignment[]> => {
    try {
      const results = await postgres.exec(
        getTranslationAssignmentRequestsQuery(status),
      );

      return results as TranslationAssignment[];
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch translation assignment requests',
      });
    }
  };
};
