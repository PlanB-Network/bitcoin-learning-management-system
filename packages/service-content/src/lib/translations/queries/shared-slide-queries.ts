import { sql } from '@blms/database';
import { normalizeLanguageCode } from '#src/utils/language-utils.ts';

/**
 * Shared database query utilities for translation slides
 * Consolidates repeated query patterns across the codebase
 */

export interface SlideQueryParams {
  courseId: string;
  language: string;
  chapterId: string;
  slideId: string;
}

export interface SlideBasicInfo {
  ppt_resource_path: string | null;
  audio_resource_path: string | null;
  course_id: string;
  language: string;
  chapter_id: string;
  slide_id: string;
  part_id: string;
  ppt_validated: boolean | null;
}

/**
 * Reusable query to get basic slide information
 * Used across multiple endpoints in translation-downloads.ts
 */
export const getSlideBasicInfoQuery = (params: SlideQueryParams) => {
  const { courseId, language, chapterId, slideId } = params;
  const normalizedLanguage = normalizeLanguageCode(language);

  return sql<SlideBasicInfo[]>`
    SELECT 
      ppt_resource_path, 
      audio_resource_path,
      course_id, 
      language, 
      chapter_id, 
      slide_id,
      part_id,
      ppt_validated
    FROM content.course_translation_slides
    WHERE course_id = ${courseId}
      AND language = ${normalizedLanguage}
      AND chapter_id = ${chapterId}
      AND slide_id = ${slideId}
  `;
};

/**
 * Reusable query to get slide information with part metadata
 * Used for PNG generation and other operations requiring part info
 */
export const getSlideWithPartInfoQuery = (params: SlideQueryParams) => {
  const { courseId, language, chapterId, slideId } = params;
  const normalizedLanguage = normalizeLanguageCode(language);

  return sql`
    SELECT 
      cts.ppt_resource_path, 
      cts.audio_resource_path,
      cts.slide_number, 
      cts.course_id, 
      cts.language, 
      cts.chapter_id, 
      cts.slide_id,
      cts.part_id,
      cc.chapter_index,
      cp.part_index
    FROM content.course_translation_slides cts
    JOIN content.course_chapters cc ON cts.chapter_id = cc.chapter_id
    JOIN content.course_parts cp ON cts.part_id = cp.part_id
    WHERE cts.course_id = ${courseId}
      AND cts.language = ${normalizedLanguage}
      AND cts.chapter_id = ${chapterId}
      AND cts.slide_id = ${slideId}
  `;
};
