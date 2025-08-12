import { sql } from '@blms/database';

export const getTranscriptAvailableLanguagesQuery = (
  courseId: string,
  partId: string,
  chapterId: string,
  slideId: string,
) => {
  return sql`
    SELECT DISTINCT language
    FROM content.course_translation_slides
    WHERE course_id = ${courseId}
      AND part_id = ${partId}
      AND chapter_id = ${chapterId}
      AND slide_id = ${slideId}
      AND (
        -- Treat original language as always available when original_content exists
        (language = (SELECT original_language FROM content.courses WHERE id = ${courseId}) AND original_content IS NOT NULL AND original_content <> '')
        OR
        -- For target languages, availability is based on ai_translated_content
        (language <> (SELECT original_language FROM content.courses WHERE id = ${courseId}) AND ai_translated_content IS NOT NULL AND ai_translated_content <> '')
      )
  `;
};
