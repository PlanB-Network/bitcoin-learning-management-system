import { sql } from '@blms/database';

/**
 * Query to get available contributors
 */
export const getAvailableContributorsQuery = () => {
  return sql`
    SELECT
      ua.uid,
      ua.username,
      ua.display_name AS "displayName",
      ua.email
    FROM users.accounts ua
    WHERE ua.role IN ('contributor', 'community')
    ORDER BY ua.display_name, ua.username
  `;
};

/**
 * Query to get all users for admin management
 */
export const getAllUsersQuery = () => {
  return sql`
    SELECT
      ua.uid,
      ua.username,
      ua.display_name AS "displayName",
      ua.email,
      ua.role,
      (
        SELECT COALESCE(ARRAY_AGG(DISTINCT language_code), ARRAY[]::text[])
        FROM users.reviewer_languages rl
        WHERE rl.reviewer_id = ua.uid
      ) AS "assignedLanguages"
    FROM users.accounts ua
    WHERE ua.role NOT IN ('admin', 'superadmin')
    ORDER BY ua.display_name, ua.username
  `;
};

/**
 * Query to get admin user management data
 */
export const getAdminUserManagementQuery = () => {
  return sql`
    SELECT
      ua.uid,
      ua.username,
      ua.display_name AS "displayName",
      ua.email,
      ua.role,
      ua.created_at AS "createdAt",
      ua.created_at AS "startDate",
      (
        SELECT COUNT(*)
        FROM users.translation_assignments ta
        WHERE ta.assignee_id = ua.uid
          AND ta.status IN ('assigned', 'in_progress', 'completed')
      ) AS "assignedCourses",
      (
        SELECT COALESCE(ARRAY_AGG(DISTINCT language_code), ARRAY[]::text[])
        FROM users.reviewer_languages rl
        WHERE rl.reviewer_id = ua.uid
      ) AS "languages"
    FROM users.accounts ua
    WHERE ua.role = 'contributor'
    ORDER BY ua.created_at DESC
  `;
};

/**
 * Query to get user details by ID
 */
export const getUserDetailsByIdQuery = (userId: string) => {
  return sql`
    SELECT
      ua.uid,
      ua.username,
      ua.display_name AS "displayName",
      ua.email,
      ua.created_at AS "createdAt",
      ua.created_at AS "startDate",
      ua.role
    FROM users.accounts ua
    WHERE ua.uid = ${userId}
  `;
};

/**
 * Query to get user's assignments with translation status
 */
export const getUserAssignmentsQuery = (userId: string) => {
  return sql`
    SELECT
      ta.id,
      ta.course_id AS "courseId",
      ta.language,
      ta.status AS "assignmentStatus",
      ta.assigned_at AS "assignedAt",
      ta.completed_at AS "completedAt",
      c.index,
      cl.name AS "courseName",
      ct.status AS "translationStatus",
      ct.updated_at AS "translationUpdatedAt",
      COALESCE(
        ROUND(
          (COUNT(CASE WHEN ctc.status = 'reviewed' THEN 1 END)::numeric /
           NULLIF(COUNT(ctc.chapter_id), 0)::numeric) * 100, 0
        ), 0
      ) AS "progress"
    FROM users.translation_assignments ta
    JOIN content.courses c ON ta.course_id = c.id
    LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
    LEFT JOIN content.course_translations ct ON (
      ct.course_id = ta.course_id
      AND ct.language = ta.language
    )
    LEFT JOIN content.course_translation_chapters ctc ON (
      ctc.course_id = ta.course_id
      AND ctc.language = ta.language
    )
    WHERE ta.assignee_id = ${userId}
    GROUP BY
      ta.id, ta.course_id, ta.language, ta.status, ta.assigned_at, ta.completed_at,
      c.index, cl.name, ct.status, ct.updated_at
    ORDER BY ta.assigned_at DESC
  `;
};

/**
 * Query to get user's reviewer languages
 */
export const getUserLanguagesQuery = (userId: string) => {
  return sql`
    SELECT language_code AS language
    FROM users.reviewer_languages
    WHERE reviewer_id = ${userId}
  `;
};

/**
 * Query to check existing assignment for course and language
 */
export const checkExistingCourseAssignmentQuery = (
  courseId: string,
  language: string,
) => {
  return sql`
    SELECT id, status
    FROM users.translation_assignments
    WHERE course_id = ${courseId}
      AND language = LOWER(${language})
      AND status IN ('assigned', 'in_progress')
  `;
};

/**
 * Query to create translation assignment
 */
export const createTranslationAssignmentQuery = (
  courseId: string,
  language: string,
  assigneeId: string,
  assignerId: string,
) => {
  return sql`
    INSERT INTO users.translation_assignments (course_id, language, assignee_id, assigner_id, status)
    VALUES (${courseId}, LOWER(${language}), ${assigneeId}, ${assignerId}, 'assigned')
    RETURNING
      id,
      course_id AS "courseId",
      language,
      assignee_id AS "assigneeId",
      assigner_id AS "assignerId",
      status,
      assigned_at AS "assignedAt",
      completed_at AS "completedAt",
      rejection_reason AS "rejectionReason"
  `;
};

/**
 * Query to create chapter assignments for all chapters
 */
export const createChapterAssignmentsQuery = (
  courseId: string,
  language: string,
  assigneeId: string,
  assignerId: string,
) => {
  return sql`
    INSERT INTO users.translation_chapter_assignments (course_id, language, part_id, chapter_id, assignee_id, assigner_id, status)
    SELECT
      ${courseId},
      LOWER(${language}),
      ch.part_id,
      ch.chapter_id,
      ${assigneeId},
      ${assignerId},
      'assigned'::assignment_status
    FROM content.course_chapters ch
    WHERE ch.course_id = ${courseId}
    ON CONFLICT (course_id, language, part_id, chapter_id, assignee_id) DO UPDATE SET
      assigner_id = EXCLUDED.assigner_id,
      assigned_at = NOW(),
      status = 'assigned'::assignment_status
  `;
};

/**
 * Query to get assignment info by ID
 */
export const getAssignmentInfoQuery = (assignmentId: string) => {
  return sql`
    SELECT course_id, language
    FROM users.translation_assignments
    WHERE id = ${assignmentId}
  `;
};

/**
 * Query to update assignment with new assignee
 */
export const updateAssignmentQuery = (
  assignmentId: string,
  newAssigneeId: string,
  assignerId: string,
) => {
  return sql`
    UPDATE users.translation_assignments
    SET
      assignee_id = ${newAssigneeId},
      assigner_id = ${assignerId},
      status = 'assigned',
      assigned_at = NOW(),
      completed_at = NULL,
      rejection_reason = NULL
    WHERE id = ${assignmentId}
    RETURNING
      id,
      course_id AS "courseId",
      language,
      assignee_id AS "assigneeId",
      assigner_id AS "assignerId",
      status,
      assigned_at AS "assignedAt",
      completed_at AS "completedAt",
      rejection_reason AS "rejectionReason"
  `;
};

/**
 * Query to create/update chapter assignments for reassignment
 */
export const updateChapterAssignmentsQuery = (
  courseId: string,
  language: string,
  newAssigneeId: string,
  assignerId: string,
) => {
  return sql`
    INSERT INTO users.translation_chapter_assignments (course_id, language, part_id, chapter_id, assignee_id, assigner_id, status)
    SELECT
      ${courseId},
      LOWER(${language}),
      ch.part_id,
      ch.chapter_id,
      ${newAssigneeId},
      ${assignerId},
      'assigned'::assignment_status
    FROM content.course_chapters ch
    WHERE ch.course_id = ${courseId}
    ON CONFLICT (course_id, language, part_id, chapter_id, assignee_id) DO UPDATE SET
      assigner_id = EXCLUDED.assigner_id,
      assigned_at = NOW(),
      status = 'assigned'::assignment_status
  `;
};
