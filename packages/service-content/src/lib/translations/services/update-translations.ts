import type { TranslationStatus } from '@blms/constants';
import type { AvailableCourseTranslation } from '@blms/types';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import { updateTranslationStatusQuery } from '../queries/update-translations.js';

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
        await transaction`
          INSERT INTO content.course_translations (course_id, language, status, created_at, updated_at)
          VALUES (${courseId}, LOWER(${language}), 'todo'::translation_status, NOW(), NOW())
          ON CONFLICT (course_id, language) DO NOTHING
        `;

        // Populate course_translation_chapters for this course-language combination
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

        // Create the main translation entry
        const results = await transaction<AvailableCourseTranslation[]>`
          INSERT INTO content.course_translations (course_id, language, status)
          VALUES (${courseId}, LOWER(${language}), 'todo'::translation_status)
          RETURNING
            course_id AS "courseId",
            language,
            status,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `;

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
