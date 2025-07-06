import type { TranslationStatus } from '@blms/constants';
import { sql } from '@blms/database';

export interface CourseTranslationSlide {
  courseId: string;
  language: string;
  partId: string;
  chapterId: string;
  slideId: string;
  slideNumber: number;
  pptValidated: boolean;
  transcriptionValidated: boolean;
  audioValidated: boolean;
  pptResourcePath: string | null;
  audioResourcePath: string | null;
  originalContent: string | null;
  translatedContent: string | null;
  status: TranslationStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Query to get course translation slides for a specific chapter
 */
export const getCourseTranslationSlidesQuery = (
  courseId: string,
  language: string,
  chapterId: string,
) => {
  return sql<CourseTranslationSlide[]>`
    SELECT
      cts.course_id AS "courseId",
      cts.language,
      cts.part_id AS "partId",
      cts.chapter_id AS "chapterId",
      cts.slide_id AS "slideId",
      cts.slide_number AS "slideNumber",
      cts.ppt_validated AS "pptValidated",
      cts.transcription_validated AS "transcriptionValidated",
      cts.audio_validated AS "audioValidated",
      cts.ppt_resource_path AS "pptResourcePath",
      cts.audio_resource_path AS "audioResourcePath",
      cts.original_content AS "originalContent",
      cts.translated_content AS "translatedContent",
      cts.status,
      cts.created_at AS "createdAt",
      cts.updated_at AS "updatedAt"
    FROM content.course_translation_slides cts
    WHERE cts.course_id = ${courseId}
      AND cts.language = LOWER(${language})
      AND cts.chapter_id = ${chapterId}
    ORDER BY cts.slide_id
  `;
};

/**
 * Query to get chapter details for translation context
 */
export const getChapterTranslationContextQuery = (
  courseId: string,
  chapterId: string,
  language: string,
) => {
  return sql`
    SELECT
      c.id AS "id",
      c.id AS "courseId",
      c.index AS "courseIndex",
      cl_en.name AS "courseName",
      cp.part_id AS "partId",
      cp.part_index AS "partIndex",
      cpl_en.title AS "partTitle",
      cc.chapter_id AS "chapterId",
      cc.chapter_index AS "chapterIndex",
      ccl_en.title AS "chapterTitle",
      ct.status AS "translationStatus",
      ctc.status AS "chapterTranslationStatus"
    FROM content.courses c
    JOIN content.course_chapters cc ON cc.course_id = c.id
    JOIN content.course_parts cp ON cp.part_id = cc.part_id
    LEFT JOIN content.courses_localized cl_en ON cl_en.course_id = c.id AND cl_en.language = 'en'
    LEFT JOIN content.course_parts_localized cpl_en ON cpl_en.part_id = cp.part_id AND cpl_en.language = 'en'
    LEFT JOIN content.course_chapters_localized ccl_en ON ccl_en.chapter_id = cc.chapter_id AND ccl_en.language = 'en'
    LEFT JOIN content.course_translations ct ON ct.course_id = c.id AND ct.language = LOWER(${language})
    LEFT JOIN content.course_translation_chapters ctc ON ctc.course_id = c.id
      AND ctc.language = LOWER(${language})
      AND ctc.chapter_id = cc.chapter_id
    WHERE c.id = ${courseId}
      AND cc.chapter_id = ${chapterId}
    LIMIT 1
  `;
};

/**
 * Query to update a course translation slide
 */
export const updateCourseTranslationSlideQuery = (
  courseId: string,
  language: string,
  chapterId: string,
  slideId: string,
  translatedContent: string | null,
  status: TranslationStatus | null,
  pptValidated: boolean | null,
  transcriptionValidated: boolean | null,
  audioValidated: boolean | null,
) => {
  return sql`
    UPDATE content.course_translation_slides
    SET
      translated_content = COALESCE(${translatedContent}, translated_content),
      status = COALESCE(${status}::translation_status, status),
      ppt_validated = COALESCE(${pptValidated}, ppt_validated),
      transcription_validated = COALESCE(${transcriptionValidated}, transcription_validated),
      audio_validated = COALESCE(${audioValidated}, audio_validated),
      updated_at = NOW()
    WHERE course_id = ${courseId}
      AND language = LOWER(${language})
      AND chapter_id = ${chapterId}
      AND slide_id = ${slideId}
    RETURNING *
  `;
};

/**
 * Query to get chapter progress for course translation overview
 * Returns chapter status based on slide completion
 */
export const getCourseTranslationChapterProgressQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
    WITH chapter_slide_counts AS (
      SELECT
        cts.chapter_id,
        cts.part_id,
        COUNT(*) as total_slides,
        COUNT(CASE WHEN cts.status IN ('reviewed', 'published') THEN 1 END) as completed_slides,
        COUNT(CASE WHEN cts.status IN ('in_progress', 'ready_for_review', 'under_review') THEN 1 END) as in_progress_slides,
        COUNT(CASE WHEN cts.status = 'todo' THEN 1 END) as todo_slides
      FROM content.course_translation_slides cts
      WHERE cts.course_id = ${courseId}
        AND cts.language = LOWER(${language})
      GROUP BY cts.chapter_id, cts.part_id
    ),
    chapter_details AS (
      SELECT
        cc.chapter_id AS "chapterId",
        cc.chapter_index AS "chapterIndex",
        ccl.title AS "chapterTitle",
        cp.part_index AS "partIndex",
        cp.part_id AS "partId"
      FROM content.course_chapters cc
      JOIN content.course_parts cp ON cp.part_id = cc.part_id
      LEFT JOIN content.course_chapters_localized ccl ON ccl.chapter_id = cc.chapter_id AND ccl.language = 'en'
      WHERE cc.course_id = ${courseId}
    )
    SELECT
      cd."chapterId",
      cd."chapterIndex",
      cd."chapterTitle",
      cd."partIndex",
      cd."partId",
      COALESCE(csc.total_slides, 0) as "totalSlides",
      COALESCE(csc.completed_slides, 0) as "completedSlides",
      COALESCE(csc.in_progress_slides, 0) as "inProgressSlides",
      COALESCE(csc.todo_slides, 0) as "todoSlides",
      CASE
        WHEN COALESCE(csc.total_slides, 0) = 0 THEN 'not-started'
        WHEN csc.completed_slides = csc.total_slides THEN 'completed'
        WHEN csc.in_progress_slides > 0 OR csc.completed_slides > 0 THEN 'in-progress'
        ELSE 'not-started'
      END as "status"
    FROM chapter_details cd
    LEFT JOIN chapter_slide_counts csc ON cd."chapterId" = csc.chapter_id
    ORDER BY cd."partIndex", cd."chapterIndex"
  `;
};
