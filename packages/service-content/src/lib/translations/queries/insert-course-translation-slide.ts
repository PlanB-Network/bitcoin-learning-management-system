import { sql } from '@blms/database';
import type { CourseTranslationSlide } from '@blms/types';

/**
 * Insert a course translation slide row. Uses ON CONFLICT DO NOTHING to avoid duplicates.
 * Returns the inserted row when a new one was created, otherwise an empty array.
 */
export const insertCourseTranslationSlideQuery = (
  courseId: string,
  language: string,
  partId: string,
  chapterId: string,
  slideId: string,
  slideNumber: number,
  pptResourcePath: string | null,
  originalContent: string | null,
  translatedContent: string | null,
) => {
  return sql<CourseTranslationSlide[]>`
    INSERT INTO content.course_translation_slides (
      course_id,
      language,
      part_id,
      chapter_id,
      slide_id,
      slide_number,
      ppt_resource_path,
      original_content,
      translated_content,
      ai_translated_content,
      created_at,
      updated_at
    ) VALUES (
      ${courseId},
      LOWER(${language}),
      ${partId},
      ${chapterId},
      ${slideId},
      ${slideNumber},
      ${pptResourcePath},
      ${originalContent},
      ${translatedContent},
      ${translatedContent},
      NOW(),
      NOW()
    ) ON CONFLICT DO NOTHING
    RETURNING
      course_id        AS "courseId",
      language,
      part_id          AS "partId",
      chapter_id       AS "chapterId",
      slide_id         AS "slideId",
      slide_number     AS "slideNumber",
      ppt_validated    AS "pptValidated",
      transcription_validated AS "transcriptionValidated",
      audio_validated  AS "audioValidated",
      ppt_resource_path AS "pptResourcePath",
      audio_resource_path AS "audioResourcePath",
      original_content AS "originalContent",
      translated_content AS "translatedContent",
      ai_translated_content AS "aiTranslatedContent",
      status,
      created_at       AS "createdAt",
      updated_at       AS "updatedAt";
  `;
};
