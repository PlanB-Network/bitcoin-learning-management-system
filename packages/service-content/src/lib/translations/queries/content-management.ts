import { sql } from '@blms/database';

/**
 * Query to get distinct topics from courses for content management
 */
export const getContentManagementTopicsQuery = () => {
  return sql`
    SELECT DISTINCT c.topic
    FROM content.courses c
    JOIN content.course_translations ct ON c.id = ct.course_id
    WHERE ct.status IN ('ready_for_review', 'under_review')
      AND c.is_archived = false
      AND c.topic IS NOT NULL
    ORDER BY c.topic
  `;
};

/**
 * Query to get basic course information by courseId
 */
export const getCourseBasicInfoQuery = (courseId: string) => {
  return sql`
    SELECT c.id, c.index, cl.name
    FROM content.courses c
    LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
    WHERE c.id = ${courseId}
    LIMIT 1
  `;
};

/**
 * Query to get course languages with translation and assignment status
 */
export const getCourseLanguagesQuery = (courseId: string) => {
  return sql`
    SELECT
      ct.language AS "languageCode",
      l.name AS "languageName",
      ct.status AS "translationStatus",
      ta.assignee_id AS "assigneeId",
      ua.username AS "assigneeUsername",
      ua.display_name AS "assigneeDisplayName"
    FROM content.course_translations ct
    LEFT JOIN users.languages l ON ct.language = l.code
    LEFT JOIN users.translation_assignments ta ON (
      ta.course_id = ct.course_id
      AND ta.language = ct.language
      AND ta.status IN ('assigned', 'in_progress', 'completed')
    )
    LEFT JOIN users.accounts ua ON ta.assignee_id = ua.uid
    WHERE ct.course_id = ${courseId}
    ORDER BY l.name
  `;
};

/**
 * Query to get course translation details for admin
 */
export const getCourseTranslationDetailsQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
    SELECT
      c.id,
      c.index,
      cl.name AS "courseName",
      ct.status AS "translationStatus",
      ct.created_at AS "translationCreatedAt",
      ct.updated_at AS "translationUpdatedAt",
      ta.assignee_id AS "assigneeId",
      ua.username AS "assigneeUsername",
      ua.display_name AS "assigneeDisplayName",
      ta.assigned_at AS "assignedAt",
      ta.status AS "assignmentStatus"
    FROM content.courses c
    LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
    LEFT JOIN content.course_translations ct ON (
      ct.course_id = c.id
      AND ct.language = LOWER(${language})
    )
    LEFT JOIN users.translation_assignments ta ON (
      ta.course_id = c.id
      AND ta.language = LOWER(${language})
      AND ta.status IN ('assigned', 'in_progress', 'completed')
    )
    LEFT JOIN users.accounts ua ON ta.assignee_id = ua.uid
    WHERE c.id = ${courseId}
    LIMIT 1
  `;
};

/**
 * Query to get parts and chapters with translation status
 */
export const getCourseTranslationChaptersQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
    SELECT
      cp.part_id AS "partId",
      cp.part_index AS "partIndex",
      cpl.title AS "partTitle",
      cc.chapter_id AS "chapterId",
      cc.chapter_index AS "chapterIndex",
      ccl.title AS "chapterTitle",
      COALESCE(ctc.status, 'todo') AS "status",
      ctc.updated_at AS "updatedAt"
    FROM content.course_parts cp
    LEFT JOIN content.course_parts_localized cpl ON (
      cp.part_id = cpl.part_id
      AND cpl.language = 'en'
    )
    LEFT JOIN content.course_chapters cc ON cp.part_id = cc.part_id
    LEFT JOIN content.course_chapters_localized ccl ON (
      cc.chapter_id = ccl.chapter_id
      AND ccl.language = 'en'
    )
    LEFT JOIN content.course_translation_chapters ctc ON (
      ctc.course_id = ${courseId}
      AND ctc.language = LOWER(${language})
      AND ctc.part_id = cp.part_id
      AND ctc.chapter_id = cc.chapter_id
    )
    WHERE cp.course_id = ${courseId}
    ORDER BY cp.part_index, cc.chapter_index
  `;
};
