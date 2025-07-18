import { sql } from '@blms/database';
import type {
  MinimalAssignmentGrade,
  MinimalCourseExamAttemptWithUsername,
} from '@blms/types';

export const getAllExamsGradesQuery = (
  courseId: string,
  isSingleTrialExamOnly: boolean,
) => {
  if (isSingleTrialExamOnly) {
    return sql<MinimalCourseExamAttemptWithUsername[]>`
        WITH ranked_attempts AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    PARTITION BY chapter_id, uid
                    ORDER BY started_at DESC
                ) as rn
            FROM users.exam_attempts ea
            WHERE ea.course_id = ${courseId}
                AND ea.exam_type = 'single_trial'
                AND ea.finalized = true
        )
        SELECT ua.username, ra.uid, ra.chapter_id, ra.exam_type, ra.score, ra.started_at, ra.finished_at
        FROM ranked_attempts ra
        JOIN users.accounts ua ON ra.uid = ua.uid
        WHERE ra.rn = 1
    `;
  }

  return sql<MinimalCourseExamAttemptWithUsername[]>`
        SELECT ua.username, ea.uid, ea.chapter_id, ea.exam_type, ea.score, ea.started_at, ea.finished_at
        FROM users.exam_attempts ea
        JOIN users.accounts ua ON ea.uid = ua.uid
        WHERE ea.course_id = ${courseId}
            AND ea.finalized = true
        ORDER BY ea.started_at DESC
    `;
};

export const getAllAssignmentsGradesQuery = (courseId: string) => {
  return sql<MinimalAssignmentGrade[]>`
        SELECT cp.uid, ua.username, cp.assignment_grade
        FROM users.course_progress cp
        JOIN users.accounts ua ON cp.uid = ua.uid
        WHERE cp.course_id = ${courseId}
    `;
};
