import type { AssignmentStatus } from '@blms/constants';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../../dependencies.js';
import {
  checkCourseTranslationExistsQuery,
  checkExistingAssignmentQuery,
  checkUserTranslationAssignmentQuery,
  createCourseTranslationQuery,
  createTranslationAssignmentQuery,
  getAssignmentDetailsByIdQuery,
  getTranslationAssignmentRequestsQuery,
  getUserTranslationAssignmentsQuery,
  populateCourseTranslationChaptersQuery,
  updateTranslationAssignmentStatusQuery,
} from '../queries/translation-assignments.js';

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
        const existingAssignment = await postgres.exec(
          checkExistingAssignmentQuery(courseId, language, userId),
        );

        if (existingAssignment.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message:
              'You already have an assignment for this course and language',
          });
        }

        // Check if course translation exists, if not create it
        const existingTranslation = await postgres.exec(
          checkCourseTranslationExistsQuery(courseId, language),
        );

        if (existingTranslation.length === 0) {
          // Create the course translation entry
          await postgres.exec(createCourseTranslationQuery(courseId, language));

          // Populate course_translation_chapters
          await postgres.exec(
            populateCourseTranslationChaptersQuery(courseId, language),
          );
        }

        // Create the assignment request
        const results = await postgres.exec(
          createTranslationAssignmentQuery(
            courseId,
            language,
            userId,
            userId,
            'requested',
          ),
        );

        if (results.length === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create translation assignment request',
          });
        }

        return results[0] as TranslationAssignment;
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
        const assignmentDetails = await postgres.exec(
          getAssignmentDetailsByIdQuery(assignmentId),
        );

        if (assignmentDetails.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Translation assignment not found',
          });
        }

        // Update assignment status
        const results = await postgres.exec(
          updateTranslationAssignmentStatusQuery(
            assignmentId,
            status,
            rejectionReason,
          ),
        );

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
      const results = await postgres.exec(
        checkUserTranslationAssignmentQuery(userId, courseId, language),
      );

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
