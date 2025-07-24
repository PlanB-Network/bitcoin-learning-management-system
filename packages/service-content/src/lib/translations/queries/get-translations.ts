import { sql } from '@blms/database';
import type { AvailableCourseTranslation } from '@blms/types';

/**
 * Query to get available course translations for a specific language and course
 * Now uses course_translations as source of truth
 */
export const getAvailableCourseTranslationsQuery = (
  language: string,
  courseId: string,
) => {
  return sql<AvailableCourseTranslation[]>`
    SELECT
      ct.course_id AS "courseId",
      ct.language,
      ct.status,
      ct.created_at AS "createdAt",
      ct.updated_at AS "updatedAt"
    FROM content.course_translations ct
    WHERE ct.language = LOWER(${language})
      AND ct.course_id = ${courseId}
      AND ct.status = 'published'
  `;
};

/**
 * Query to get course translations for a specific user
 * Returns all translations for the language regardless of status
 */
export const getUserCourseTranslationsQuery = (language: string) => {
  return sql<AvailableCourseTranslation[]>`
    SELECT
      ct.course_id AS "courseId",
      ct.language,
      ct.status,
      ct.created_at AS "createdAt",
      ct.updated_at AS "updatedAt"
    FROM content.course_translations ct
    WHERE ct.language = LOWER(${language})
    ORDER BY ct.course_id
  `;
};

/**
 * Query to get courses ready for review (status = 'ready_for_review')
 * These are the courses that should be displayed in the contribute app
 * Excludes courses that are already assigned to users
 */
export const getCoursesReadyForReviewQuery = (language: string) => {
  return sql<AvailableCourseTranslation[]>`
    SELECT
      ct.course_id AS "courseId",
      ct.language,
      ct.status,
      ct.created_at AS "createdAt",
      ct.updated_at AS "updatedAt"
    FROM content.course_translations ct
    JOIN content.courses c ON ct.course_id = c.id
    WHERE ct.language = LOWER(${language})
      AND ct.status = 'ready_for_review'
      AND c.is_archived = false
      AND NOT EXISTS (
        SELECT 1
        FROM users.translation_assignments ta
        WHERE ta.course_id = ct.course_id
          AND ta.language = ct.language
          AND ta.status = 'assigned'
      )
    ORDER BY ct.updated_at DESC
  `;
};

/**
 * Query to get user's contributions under review (status = 'under_review' or 'assigned' with matching contributor_id)
 * These are the courses that should be displayed in "yourContributions"
 */
export const getUserContributionsUnderReviewQuery = (
  language: string,
  userUid: string,
) => {
  return sql<AvailableCourseTranslation[]>`
    SELECT
      ct.course_id AS "courseId",
      ct.language,
      ct.status,
      ct.created_at AS "createdAt",
      ct.updated_at AS "updatedAt",
      ta.status AS "assignmentStatus"
    FROM content.course_translations ct
    JOIN content.courses c ON ct.course_id = c.id
    JOIN users.translation_assignments ta ON (
      ta.course_id = ct.course_id
      AND LOWER(ta.language) = LOWER(ct.language)
    )
    WHERE LOWER(ct.language) = LOWER(${language})
      AND ta.assignee_id = ${userUid}
      AND ta.status IN ('assigned', 'in_progress')
      AND c.is_archived = false
    ORDER BY ct.updated_at DESC
  `;
};

/**
 * Query to get translation status with parts and chapter counts for a specific course
 */
export const getCourseTranslationStatusQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
    WITH translation AS (
      SELECT
        ct.course_id AS "courseId",
        ct.language,
        ct.status,
        ct.created_at AS "createdAt",
        ct.updated_at AS "updatedAt"
      FROM content.course_translations ct
      WHERE ct.course_id = ${courseId}
      AND ct.language = LOWER(${language})
      LIMIT 1
    ),
    parts AS (
      SELECT
        cp.course_id AS "courseId",
        ${language.toLowerCase()} as language,
        cp.part_id AS "partId",
        'todo'::translation_status as status,
        cp.name
      FROM content.course_parts cp
      JOIN translation tr ON cp.course_id = tr."courseId"
    )
    SELECT
      tr.*,
      COALESCE(
        json_agg(
          json_build_object(
            'courseId', p."courseId",
            'language', p.language,
            'partId', p."partId",
            'status', p.status,
            'name', p.name,
            'chaptersCount', (
              SELECT COUNT(*)
              FROM content.course_translation_chapters tc
              WHERE tc.course_id = p."courseId"
                AND tc.language = p.language
                AND tc.part_id = p."partId"
            )
          )
        ) FILTER (WHERE p."courseId" IS NOT NULL), '[]'::json
      ) AS parts
    FROM translation tr
    LEFT JOIN parts p ON true
    GROUP BY
      tr."courseId",
      tr.language,
      tr.status,
      tr."createdAt",
      tr."updatedAt"
  `;
};

/**
 * Query to calculate translation progress for a specific language
 * Returns the percentage of courses that have published translations
 */
export const getTranslationProgressQuery = (language: string) => {
  return sql<{ progress: number }[]>`
    WITH total_courses AS (
      SELECT COUNT(*) as total
      FROM content.courses c
      WHERE c.is_archived = false
    ),
    translated_courses AS (
      SELECT COUNT(*) as translated
      FROM content.course_translations ct
      JOIN content.courses c ON ct.course_id = c.id
      WHERE ct.language = LOWER(${language})
        AND ct.status = 'published'
        AND c.is_archived = false
    )
    SELECT
      CASE
        WHEN tc.total = 0 THEN 0
        ELSE ROUND((trc.translated::decimal / tc.total::decimal) * 100, 1)
      END as progress
    FROM total_courses tc, translated_courses trc
  `;
};

/**
 * Query to get all courses for admin content management
 * This includes both unassigned courses ready for review and assigned courses
 */
export const getAdminContentManagementCoursesQuery = (
  language?: string,
  topic?: string,
) => {
  let whereClause = sql`
    WHERE ct.status IN ('ready_for_review', 'under_review')
      AND c.is_archived = false
  `;

  if (language) {
    whereClause = sql`${whereClause} AND ct.language = LOWER(${language})`;
  }

  if (topic && topic !== 'all') {
    whereClause = sql`${whereClause} AND c.topic = ${topic}`;
  }

  return sql`
    SELECT
      ct.course_id AS "courseId",
      ct.language,
      ct.status,
      CASE
        WHEN ta.status IS NOT NULL THEN 'assigned'
        ELSE 'not_assigned'
      END AS "isAssigned",
      ct.created_at AS "createdAt",
      ct.updated_at AS "updatedAt",
      c.index AS "index",
      c.topic AS "courseTopic",
      cl.name AS "courseName",
      ta.id AS "assignmentId",
      ta.assignee_id AS "assigneeId",
      ta.assigner_id AS "assignerId",
      ta.status AS "assignmentStatus",
      ta.assigned_at AS "assignedAt",
      ta.completed_at AS "completedAt",
      ua.username AS "assigneeUsername",
      ua.display_name AS "assigneeDisplayName",
      -- Calculate progress based on translation chapters status
      COALESCE(
        ROUND(
          (COUNT(CASE WHEN ctc.status IN ('reviewed', 'published') THEN 1 END)::numeric /
           NULLIF(COUNT(ctc.chapter_id), 0)) * 100
        ), 0
      ) AS "progress"
    FROM content.course_translations ct
    JOIN content.courses c ON ct.course_id = c.id
    LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
    LEFT JOIN users.translation_assignments ta ON (
      ta.course_id = ct.course_id
      AND ta.language = ct.language
    )
    LEFT JOIN users.accounts ua ON ta.assignee_id = ua.uid
    LEFT JOIN content.course_translation_chapters ctc ON (
      ctc.course_id = ct.course_id
      AND ctc.language = ct.language
    )
    ${whereClause}
    GROUP BY
      ct.course_id, ct.language, ct.status, ct.created_at, ct.updated_at,
      c.index, c.topic, cl.name, ta.id, ta.assignee_id, ta.assigner_id, ta.status,
      ta.assigned_at, ta.completed_at, ua.username, ua.display_name
    ORDER BY
      CASE
        WHEN ta.status IS NULL THEN 0  -- Unassigned courses first
        ELSE 1
      END,
      ct.updated_at DESC
  `;
};
