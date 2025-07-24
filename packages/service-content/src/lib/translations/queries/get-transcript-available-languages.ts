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
      AND translated_content IS NOT NULL
      AND translated_content <> ''
  `;
};
