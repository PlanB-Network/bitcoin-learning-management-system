import type {
  AvailableCourseTranslation,
  CourseTranslationStatus,
} from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import {
  getAdminContentManagementCoursesQuery,
  getAvailableCourseTranslationsQuery,
  getCourseTranslationStatusQuery,
  getCoursesReadyForReviewQuery,
  getTranslationProgressQuery,
  getUserContributionsUnderReviewQuery,
  getUserCourseTranslationsQuery,
} from '../queries/get-translations.js';

/**
 * Service to get available course translations for a language
 */
export const createGetAvailableCourseTranslations = ({
  postgres,
}: Dependencies) => {
  return async (
    language: string,
    courseId: string,
  ): Promise<AvailableCourseTranslation[]> => {
    return postgres.exec(
      getAvailableCourseTranslationsQuery(language, courseId),
    );
  };
};

/**
 * Service to get user's course translations for a language
 */
export const createGetUserCourseTranslations = ({ postgres }: Dependencies) => {
  return async (language: string): Promise<AvailableCourseTranslation[]> => {
    return postgres.exec(getUserCourseTranslationsQuery(language));
  };
};

/**
 * Service to get translation status for a specific course and language
 */
export const createGetCourseTranslationStatus = ({
  postgres,
}: Dependencies) => {
  return async ({
    courseId,
    language,
  }: {
    courseId: string;
    language: string;
  }): Promise<CourseTranslationStatus> => {
    const results = await postgres.exec(
      getCourseTranslationStatusQuery(courseId, language),
    );

    if (results.length === 0) {
      throw new Error('Translation not found');
    }

    return results[0] as CourseTranslationStatus;
  };
};

/**
 * Service to get courses ready for review (status = 'ready_for_review')
 * These are the courses that should be displayed in the contribute app
 */
export const createGetCoursesReadyForReview = ({ postgres }: Dependencies) => {
  return async (language: string): Promise<AvailableCourseTranslation[]> => {
    return postgres.exec(getCoursesReadyForReviewQuery(language));
  };
};

/**
 * Service to get user's contributions under review (status = 'under_review' or 'assigned' with matching contributor_id)
 * These are the courses that should be displayed in "yourContributions"
 */
export const createGetUserContributionsUnderReview = (
  dependencies: Dependencies,
) => {
  return async (language: string, userUid: string) => {
    try {
      const result = await dependencies.postgres.exec(
        getUserContributionsUnderReviewQuery(language, userUid),
      );

      return result;
    } catch (error) {
      console.error('getUserContributionsUnderReview - Error:', error);
      throw error;
    }
  };
};

/**
 * Service to get translation progress for a specific language
 */
export const createGetTranslationProgress = ({ postgres }: Dependencies) => {
  return async (language: string): Promise<number> => {
    const result = await postgres.exec(getTranslationProgressQuery(language));
    return result[0]?.progress || 0;
  };
};

/**
 * Service to get all courses for admin content management
 * This includes both unassigned courses ready for review and assigned courses
 */
export const createGetAdminContentManagementCourses = ({
  postgres,
}: Dependencies) => {
  return async (language?: string, topic?: string) => {
    const results = await postgres.exec(
      getAdminContentManagementCoursesQuery(language, topic),
    );

    return results.map((row: any) => ({
      ...row,
      topic: row.courseTopic,
    }));
  };
};
