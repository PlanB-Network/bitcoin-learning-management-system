import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../../dependencies.js';
import {
  checkExistingCourseAssignmentQuery,
  createChapterAssignmentsQuery,
  createTranslationAssignmentQuery,
  getAdminUserManagementQuery,
  getAllUsersQuery,
  getAssignmentInfoQuery,
  getAvailableContributorsQuery,
  getUserAssignmentsQuery,
  getUserDetailsByIdQuery,
  getUserLanguagesQuery,
  updateAssignmentQuery,
  updateChapterAssignmentsQuery,
} from '../queries/user-management.js';

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
      const result = await postgres.exec(getAvailableContributorsQuery());
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
      const result = await postgres.exec(getAllUsersQuery());
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
      const result = await postgres.exec(getAdminUserManagementQuery());

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
      const userResult = await postgres.exec(getUserDetailsByIdQuery(userId));

      if (userResult.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const user = userResult[0];

      // Get user's assignments with translation status
      const assignmentsResult = await postgres.exec(
        getUserAssignmentsQuery(userId),
      );

      // Get user's languages
      const languagesResult = await postgres.exec(
        getUserLanguagesQuery(userId),
      );

      return {
        ...user,
        assignments: assignmentsResult.map((assignment: any) => ({
          ...assignment,
          assignmentStatus: assignment.assignmentStatus,
        })),
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
      const existingAssignment = await postgres.exec(
        checkExistingCourseAssignmentQuery(courseId, language),
      );

      if (existingAssignment.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Course is already assigned to another contributor',
        });
      }

      // Use proper transaction handling
      return await postgres.begin(async (transaction: any) => {
        // Create the assignment with 'assigned' status
        const result = await postgres.exec(
          createTranslationAssignmentQuery(
            courseId,
            language,
            assigneeId,
            assignerId,
          ),
        );

        // Create chapter assignments for all chapters
        await postgres.exec(
          createChapterAssignmentsQuery(
            courseId,
            language,
            assigneeId,
            assignerId,
          ),
        );

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
        const assignmentInfo = await postgres.exec(
          getAssignmentInfoQuery(assignmentId),
        );

        if (assignmentInfo.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assignment not found',
          });
        }

        const { course_id: courseId, language } = assignmentInfo[0];

        // Update the existing assignment
        const result = await postgres.exec(
          updateAssignmentQuery(assignmentId, newAssigneeId, assignerId),
        );

        // Create/update chapter assignments for all chapters
        await postgres.exec(
          updateChapterAssignmentsQuery(
            courseId,
            language,
            newAssigneeId,
            assignerId,
          ),
        );

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

/**
 * Service to get the languages that a reviewer (contributor) is allowed to work with.
 */
export const createGetReviewerLanguages = ({ postgres }: Dependencies) => {
  return async ({ userId }: { userId: string }) => {
    try {
      const languagesResult = await postgres.exec(
        getUserLanguagesQuery(userId),
      );
      // Map to simple string array
      return languagesResult.map((row: any) => row.language);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching reviewer languages:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch reviewer languages',
      });
    }
  };
};
