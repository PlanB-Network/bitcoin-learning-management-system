import type { TranslationStatus } from '@blms/constants';
import type { AvailableCourseTranslation } from '@blms/types';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import {
  createCourseTranslationQuery,
  createCourseTranslationsInitQuery,
  populateCourseTranslationChaptersQuery,
  startCourseTranslationChaptersQuery,
  startCourseTranslationsQuery,
  updateCourseTranslationChaptersToReadyForReviewQuery,
  updateCourseTranslationToReadyForReviewQuery,
  updateTranslationStatusQuery,
} from '../queries/update-translations.js';

/**
 * Service to create a new translation for a course
 */
export const createCreateCourseTranslation = ({ postgres }: Dependencies) => {
  return async ({
    courseId,
    language,
  }: {
    courseId: string;
    language: string;
  }): Promise<AvailableCourseTranslation> => {
    try {
      return await postgres.begin(async (transaction) => {
        // Create course_translations entry if it doesn't exist
        await postgres.exec(
          createCourseTranslationsInitQuery(courseId, language),
        );

        // Populate course_translation_chapters for this course-language combination
        await postgres.exec(
          populateCourseTranslationChaptersQuery(courseId, language),
        );

        // Create the main translation entry
        const results = await postgres.exec(
          createCourseTranslationQuery(courseId, language),
        );

        if (results.length === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create translation',
          });
        }

        const translation = results[0];

        return translation;
      });
    } catch (error) {
      // Check if error is related to unique constraint
      if (error instanceof Error && error.message.includes('unique')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Translation already exists for this course and language',
        });
      }

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create translation',
      });
    }
  };
};

/**
 * Service to update translation status
 */
export const createUpdateTranslationStatus = ({ postgres }: Dependencies) => {
  return async ({
    courseId,
    language,
    status,
  }: {
    courseId: string;
    language: string;
    status: TranslationStatus;
  }): Promise<AvailableCourseTranslation> => {
    try {
      const results = await postgres.exec(
        updateTranslationStatusQuery(courseId, language, status),
      );

      if (results.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation not found',
        });
      }

      return results[0];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update translation status',
      });
    }
  };
};

/**
 * Service to start translations by updating status from 'todo' to 'in_progress' for multiple languages
 */
export const createStartTranslations = ({ postgres }: Dependencies) => {
  return async ({
    courseId,
    languages,
  }: {
    courseId: string;
    languages: string[];
  }): Promise<AvailableCourseTranslation[]> => {
    try {
      // 1. Ensure base translation rows and chapter rows exist for each language
      for (const lang of languages) {
        await postgres.exec(createCourseTranslationsInitQuery(courseId, lang));
        await postgres.exec(
          populateCourseTranslationChaptersQuery(courseId, lang),
        );
      }

      // 2. Update course_translations to in_progress
      const translationResults = await postgres.exec(
        startCourseTranslationsQuery(courseId, languages),
      );

      // 3. Update course_translation_chapters to in_progress
      await postgres.exec(
        startCourseTranslationChaptersQuery(courseId, languages),
      );

      return translationResults;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to start translations',
      });
    }
  };
};

/**
 * Service to set translations & chapters to ready_for_review
 */
export const createSetTranslationsReadyForReview = ({
  postgres,
}: Dependencies) => {
  return async (courseId: string, languages: string[]) => {
    const langList = languages.map((l) => l.toLowerCase());
    await postgres.exec(
      updateCourseTranslationToReadyForReviewQuery(courseId, langList),
    );
    await postgres.exec(
      updateCourseTranslationChaptersToReadyForReviewQuery(courseId, langList),
    );
  };
};
