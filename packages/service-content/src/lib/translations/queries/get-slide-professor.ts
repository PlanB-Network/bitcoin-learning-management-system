import { sql } from '@blms/database';

export interface SlideProfessor {
  professorName: string | null;
}

/**
 * Query to get the professor name for a specific course translation slide
 */
export const getSlideProfessorQuery = (
  courseId: string,
  language: string,
  partId: string,
  chapterId: string,
  slideId: string,
) => {
  return sql<SlideProfessor[]>`
    SELECT
      cts.professor_name AS "professorName"
    FROM content.course_translation_slides cts
    WHERE cts.course_id = ${courseId}
      AND cts.language = LOWER(${language})
      AND cts.part_id = ${partId}
      AND cts.chapter_id = ${chapterId}
      AND cts.slide_id = ${slideId}
    LIMIT 1
  `;
};
