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

/**
 * Query to update course translation status to "under_review"
 */
export const updateCourseTranslationToUnderReviewQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
    UPDATE content.course_translations
    SET
      status = 'under_review'::translation_status,
      updated_at = NOW()
    WHERE course_id = ${courseId} AND language = LOWER(${language})
    RETURNING *
  `;
};

/**
 * Query to update course translation status to "ready_for_review"
 */
export const updateCourseTranslationToReadyForReviewQuery = (
  courseId: string,
  languages: string[],
) => {
  return sql`
    UPDATE content.course_translations
    SET
      status = 'ready_for_review'::translation_status,
      updated_at = NOW()
    WHERE course_id = ${courseId} AND language = ANY(${languages})
      AND status = 'in_progress'::translation_status
  `;
};

/**
 * Query to update course translation chapters status to "ready_for_review"
 */
export const updateCourseTranslationChaptersToReadyForReviewQuery = (
  courseId: string,
  languages: string[],
) => {
  return sql`
    UPDATE content.course_translation_chapters
    SET
      status = 'ready_for_review'::translation_status,
      updated_at = NOW()
    WHERE course_id = ${courseId} AND language = ANY(${languages})
      AND status = 'in_progress'::translation_status
  `;
};

/**
 * Query to update course translation chapters status to "under_review"
 */
export const updateCourseTranslationChaptersToUnderReviewQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
    UPDATE content.course_translation_chapters
    SET
      status = 'under_review'::translation_status,
      updated_at = NOW()
    WHERE course_id = ${courseId} AND language = LOWER(${language})
    RETURNING *
  `;
};

/**
 * Query to create or initialize course translations
 */
export const createCourseTranslationsInitQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
    INSERT INTO content.course_translations (course_id, language, status, created_at, updated_at)
    VALUES (${courseId}, LOWER(${language}), 'todo'::translation_status, NOW(), NOW())
    ON CONFLICT (course_id, language) DO NOTHING
  `;
};

/**
 * Query to populate course translation chapters
 */
export const populateCourseTranslationChaptersQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
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
};

/**
 * Query to start translations by updating status from 'todo' to 'in_progress' for multiple languages
 */
export const startCourseTranslationsQuery = (
  courseId: string,
  languages: string[],
) => {
  const languageList = languages.map((lang) => lang.toLowerCase());

  return sql<AvailableCourseTranslation[]>`
    UPDATE content.course_translations
    SET
      status = ${TranslationStatus.InProgress},
      updated_at = NOW()
    WHERE
      course_id = ${courseId}
      AND language = ANY(${languageList})
      AND status = ${TranslationStatus.Todo}
    RETURNING
      course_id AS "courseId",
      language,
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
};

/**
 * Query to start translations for chapters by updating status from 'todo' to 'in_progress' for multiple languages
 */
export const startCourseTranslationChaptersQuery = (
  courseId: string,
  languages: string[],
) => {
  const languageList = languages.map((lang) => lang.toLowerCase());

  return sql`
    UPDATE content.course_translation_chapters
    SET
      status = ${TranslationStatus.InProgress},
      updated_at = NOW()
    WHERE
      course_id = ${courseId}
      AND language = ANY(${languageList})
      AND status = ${TranslationStatus.Todo}
  `;
};
