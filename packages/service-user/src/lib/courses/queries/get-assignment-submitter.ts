import { sql } from '@blms/database';

export interface AssignmentSubmitter {
  assignmentId: string;
  assignmentName: string | null;
  username: string;
}

export const getAssignmentSubmitterQuery = (courseId: string, uid: string) => {
  return sql<AssignmentSubmitter[]>`
    SELECT
      cp.affected_assignment_id AS assignment_id,
      ca.name AS assignment_name,
      ua.username
    FROM users.course_progress cp
    JOIN content.course_assignment ca ON ca.id = cp.affected_assignment_id
    JOIN users.accounts ua ON ua.uid = cp.uid
    WHERE cp.uid = ${uid} AND cp.course_id = ${courseId};
  `;
};
