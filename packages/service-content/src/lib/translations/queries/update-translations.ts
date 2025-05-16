import { TranslationStatus } from '@blms/constants';
import { sql } from '@blms/database';
import type { AvailableCourseTranslation } from '@blms/types';

/**
 * Query to create a new translation for a course
 */
export const createCourseTranslationQuery = (
  courseId: string,
  language: string,
) => {
  return sql<AvailableCourseTranslation[]>`
    INSERT INTO content.course_translations (course_id, language, status)
    VALUES (${courseId}, LOWER(${language}), ${TranslationStatus.Todo})
    RETURNING
      course_id AS "courseId",
      language,
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
};

/**
 * Query to update a translation status
 */
export const updateTranslationStatusQuery = (
  courseId: string,
  language: string,
  status: TranslationStatus,
) => {
  return sql<AvailableCourseTranslation[]>`
    UPDATE content.course_translations
    SET
      status = ${status},
      updated_at = NOW()
    WHERE course_id = ${courseId} AND language = ${language}
    RETURNING
      course_id AS "courseId",
      language,
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
};
