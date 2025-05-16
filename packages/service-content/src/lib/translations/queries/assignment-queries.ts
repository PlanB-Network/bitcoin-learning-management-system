import { sql } from '@blms/database';

/**
 * Query to create a translation assignment request
 */
export const createTranslationAssignmentQuery = (
  courseId: string,
  language: string,
  assigneeId: string,
  assignerId: string,
  status: string,
) => {
  return sql`
    INSERT INTO users.translation_assignments (course_id, language, assignee_id, assigner_id, status)
    VALUES (${courseId}, LOWER(${language}), ${assigneeId}, ${assignerId}, ${status})
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
 * Query to get user's translation assignments
 */
export const getUserTranslationAssignmentsQuery = (
  userId: string,
  language?: string,
  status?: string,
) => {
  if (language && status) {
    return sql`
      SELECT
        ta.id,
        ta.course_id AS "courseId",
        ta.language,
        ta.assignee_id AS "assigneeId",
        ta.assigner_id AS "assignerId",
        ta.status,
        ta.assigned_at AS "assignedAt",
        ta.completed_at AS "completedAt",
        ta.rejection_reason AS "rejectionReason",
        c.index AS "courseIndex",
        cl.name AS "courseName"
      FROM users.translation_assignments ta
      JOIN content.courses c ON ta.course_id = c.id
      LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
      WHERE ta.assignee_id = ${userId}
        AND ta.language = LOWER(${language})
        AND ta.status = ${status}
      ORDER BY ta.assigned_at DESC
    `;
  }

  if (language) {
    return sql`
      SELECT
        ta.id,
        ta.course_id AS "courseId",
        ta.language,
        ta.assignee_id AS "assigneeId",
        ta.assigner_id AS "assignerId",
        ta.status,
        ta.assigned_at AS "assignedAt",
        ta.completed_at AS "completedAt",
        ta.rejection_reason AS "rejectionReason",
        c.index AS "courseIndex",
        cl.name AS "courseName"
      FROM users.translation_assignments ta
      JOIN content.courses c ON ta.course_id = c.id
      LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
      WHERE ta.assignee_id = ${userId}
        AND ta.language = LOWER(${language})
      ORDER BY ta.assigned_at DESC
    `;
  }

  if (status) {
    return sql`
      SELECT
        ta.id,
        ta.course_id AS "courseId",
        ta.language,
        ta.assignee_id AS "assigneeId",
        ta.assigner_id AS "assignerId",
        ta.status,
        ta.assigned_at AS "assignedAt",
        ta.completed_at AS "completedAt",
        ta.rejection_reason AS "rejectionReason",
        c.index AS "courseIndex",
        cl.name AS "courseName"
      FROM users.translation_assignments ta
      JOIN content.courses c ON ta.course_id = c.id
      LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
      WHERE ta.assignee_id = ${userId}
        AND ta.status = ${status}
      ORDER BY ta.assigned_at DESC
    `;
  }

  return sql`
    SELECT
      ta.id,
      ta.course_id AS "courseId",
      ta.language,
      ta.assignee_id AS "assigneeId",
      ta.assigner_id AS "assignerId",
      ta.status,
      ta.assigned_at AS "assignedAt",
      ta.completed_at AS "completedAt",
      ta.rejection_reason AS "rejectionReason",
      c.index AS "courseIndex",
      cl.name AS "courseName"
    FROM users.translation_assignments ta
    JOIN content.courses c ON ta.course_id = c.id
    LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
    WHERE ta.assignee_id = ${userId}
    ORDER BY ta.assigned_at DESC
  `;
};

/**
 * Query to update translation assignment status
 */
export const updateTranslationAssignmentStatusQuery = (
  assignmentId: string,
  status: string,
  rejectionReason?: string,
) => {
  if (status === 'completed') {
    return sql`
      UPDATE users.translation_assignments
      SET
        status = ${status},
        completed_at = NOW()
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
  }

  if (status === 'rejected' && rejectionReason) {
    return sql`
      UPDATE users.translation_assignments
      SET
        status = ${status},
        completed_at = NULL,
        rejection_reason = ${rejectionReason}
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
  }

  return sql`
    UPDATE users.translation_assignments
    SET
      status = ${status},
      completed_at = NULL
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
 * Query to get all translation assignment requests (for admins)
 */
export const getTranslationAssignmentRequestsQuery = (status?: string) => {
  if (status) {
    return sql`
      SELECT
        ta.id,
        ta.course_id AS "courseId",
        ta.language,
        ta.assignee_id AS "assigneeId",
        ta.assigner_id AS "assignerId",
        ta.status,
        ta.assigned_at AS "assignedAt",
        ta.completed_at AS "completedAt",
        ta.rejection_reason AS "rejectionReason",
        c.index AS "courseIndex",
        cl.name AS "courseName",
        ua.username AS "assigneeUsername",
        uas.username AS "assignerUsername"
      FROM users.translation_assignments ta
      JOIN content.courses c ON ta.course_id = c.id
      LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
      JOIN users.accounts ua ON ta.assignee_id = ua.uid
      JOIN users.accounts uas ON ta.assigner_id = uas.uid
      WHERE ta.status = ${status}
      ORDER BY ta.assigned_at DESC
    `;
  }

  return sql`
    SELECT
      ta.id,
      ta.course_id AS "courseId",
      ta.language,
      ta.assignee_id AS "assigneeId",
      ta.assigner_id AS "assignerId",
      ta.status,
      ta.assigned_at AS "assignedAt",
      ta.completed_at AS "completedAt",
      ta.rejection_reason AS "rejectionReason",
      c.index AS "courseIndex",
      cl.name AS "courseName",
      ua.username AS "assigneeUsername",
      uas.username AS "assignerUsername"
    FROM users.translation_assignments ta
    JOIN content.courses c ON ta.course_id = c.id
    LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
    JOIN users.accounts ua ON ta.assignee_id = ua.uid
    JOIN users.accounts uas ON ta.assigner_id = uas.uid
    ORDER BY ta.assigned_at DESC
  `;
};

/**
 * Query to check if user already has an assignment for a course-language combination
 */
export const checkExistingAssignmentQuery = (
  courseId: string,
  language: string,
  assigneeId: string,
) => {
  return sql`
    SELECT id
    FROM users.translation_assignments
    WHERE course_id = ${courseId}
      AND language = LOWER(${language})
      AND assignee_id = ${assigneeId}
    LIMIT 1
  `;
};
