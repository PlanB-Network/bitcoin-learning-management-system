import { sql } from '@blms/database';

// For teacher-led courses (that have single_trial exams)
export const calculateCourseScoreForUser = (uid: string, courseId: string) => {
  return sql`
    WITH calculated_scores AS (
      SELECT
        ucp.uid,
        ucp.course_id,
        (
          COALESCE((
            SELECT SUM(ea.score::float * ccl.rate_weight / 100)
            FROM users.exam_attempts ea
            JOIN content.course_chapters_localized ccl
              ON ea.chapter_id = ccl.chapter_id AND ea.course_id = ccl.course_id
            WHERE
              ea.exam_type = 'single_trial'
              AND ea.uid = ucp.uid
              AND ea.course_id = ucp.course_id
              AND ccl.language = cc.original_language
          ), 0)
          +
          COALESCE(ucp.assignment_grade::float / cc.assignment_weight, 0)
        ) AS totalScore
      FROM users.course_progress ucp
      JOIN content.courses cc ON ucp.course_id = cc.id
      WHERE ucp.uid = ${uid}
        AND ucp.course_id = ${courseId}
    )

    UPDATE users.course_progress ucp
    SET total_score = cs.totalScore
    FROM calculated_scores cs
    WHERE ucp.uid = cs.uid
      AND ucp.course_id = cs.course_id;
    `;
};

export const calculateCourseScoreForAllUsers = (courseId: string) => {
  return sql`
    WITH exam_scores AS (
      SELECT
        ea.uid,
        ea.course_id,
        ROUND(SUM(ea.score::float * ccl.rate_weight / 100)) AS exam_score
      FROM users.exam_attempts ea
      JOIN content.course_chapters_localized ccl
        ON ea.chapter_id = ccl.chapter_id
        AND ea.course_id = ccl.course_id
      JOIN content.courses cc ON ea.course_id = cc.id
      WHERE
        cc.id = ${courseId} AND
        ea.exam_type = 'single_trial'
        AND ccl.language = cc.original_language
      GROUP BY ea.uid, ea.course_id
    ),
    computed_scores AS (
      SELECT
        ucp.uid,
        ucp.course_id,
        COALESCE(es.exam_score, 0) +
        COALESCE(ucp.assignment_grade::float / cc.assignment_weight, 0) AS total_score
      FROM users.course_progress ucp
      JOIN content.courses cc ON ucp.course_id = cc.id
      LEFT JOIN exam_scores es ON ucp.uid = es.uid AND ucp.course_id = es.course_id
      WHERE cc.id = ${courseId}
    )
    UPDATE users.course_progress ucp
    SET total_score = cs.total_score
    FROM computed_scores cs
    WHERE ucp.uid = cs.uid
      AND ucp.course_id = cs.course_id;
    `;
};
