import { sql } from '@blms/database';
import type { CourseTranslationUpload } from '@blms/types';

/**
 * Query to create a new course translation upload
 */
export const createCourseTranslationUploadQuery = (
  courseId: string,
  originalLanguage: string,
  translateLanguages: string[],
  uploaderId: string,
  partId: string,
  chapterId: string,
  pptxFileUrl?: string,
  textFileUrl?: string,
) => {
  return sql<CourseTranslationUpload[]>`
    INSERT INTO content.course_translation_uploads (
      course_id,
      original_language,
      translation_languages,
      uploader_id,
      part_id,
      chapter_id,
      pptx_file_url,
      text_file_url
    ) VALUES (
      ${courseId},
      ${originalLanguage},
      ${translateLanguages},
      ${uploaderId},
      ${partId},
      ${chapterId},
      ${pptxFileUrl},
      ${textFileUrl}
    )
    RETURNING
      id,
      course_id           AS "courseId",
      original_language   AS "originalLanguage",
      translation_languages AS "translationLanguages",
      uploader_id         AS "uploaderId",
      part_id             AS "partId",
      chapter_id          AS "chapterId",
      pptx_file_url       AS "pptxFileUrl",
      text_file_url       AS "textFileUrl",
      upload_success      AS "uploadSuccess",
      error_message       AS "errorMessage",
      created_at          AS "createdAt",
      updated_at          AS "updatedAt"
  `;
};

/**
 * Query to update a course translation upload
 */
export const updateCourseTranslationUploadQuery = (
  id: string,
  pptxFileUrl?: string,
  textFileUrl?: string,
  uploadSuccess?: boolean,
  errorMessage?: string,
) => {
  return sql<CourseTranslationUpload[]>`
    UPDATE content.course_translation_uploads
    SET
      pptx_file_url = COALESCE(${pptxFileUrl}, pptx_file_url),
      text_file_url = COALESCE(${textFileUrl}, text_file_url),
      upload_success = COALESCE(${uploadSuccess}, upload_success),
      error_message = COALESCE(${errorMessage}, error_message),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      course_id           AS "courseId",
      original_language   AS "originalLanguage",
      translation_languages AS "translationLanguages",
      uploader_id         AS "uploaderId",
      part_id             AS "partId",
      chapter_id          AS "chapterId",
      pptx_file_url       AS "pptxFileUrl",
      text_file_url       AS "textFileUrl",
      upload_success      AS "uploadSuccess",
      error_message       AS "errorMessage",
      created_at          AS "createdAt",
      updated_at          AS "updatedAt"
  `;
};

/**
 * Query to get course translation uploads for a specific course
 */
export const getCourseTranslationUploadsQuery = (courseId: string) => {
  return sql<CourseTranslationUpload[]>`
    SELECT
      id,
      course_id           AS "courseId",
      original_language   AS "originalLanguage",
      translation_languages AS "translationLanguages",
      uploader_id         AS "uploaderId",
      part_id             AS "partId",
      chapter_id          AS "chapterId",
      pptx_file_url       AS "pptxFileUrl",
      text_file_url       AS "textFileUrl",
      upload_success      AS "uploadSuccess",
      error_message       AS "errorMessage",
      created_at          AS "createdAt",
      updated_at          AS "updatedAt"
    FROM content.course_translation_uploads
    WHERE course_id = ${courseId}
    ORDER BY created_at DESC
  `;
};

/**
 * Query to get a specific course translation upload by ID
 */
export const getCourseTranslationUploadByIdQuery = (id: string) => {
  return sql<CourseTranslationUpload[]>`
    SELECT
      id,
      course_id           AS "courseId",
      original_language   AS "originalLanguage",
      translation_languages AS "translationLanguages",
      uploader_id         AS "uploaderId",
      part_id             AS "partId",
      chapter_id          AS "chapterId",
      pptx_file_url       AS "pptxFileUrl",
      text_file_url       AS "textFileUrl",
      upload_success      AS "uploadSuccess",
      error_message       AS "errorMessage",
      created_at          AS "createdAt",
      updated_at          AS "updatedAt"
    FROM content.course_translation_uploads
    WHERE id = ${id}
  `;
};
