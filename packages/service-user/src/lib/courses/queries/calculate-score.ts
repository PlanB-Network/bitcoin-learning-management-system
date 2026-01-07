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
            SELECT SUM(best.score::float * ccl.rate_weight / 100)
            FROM (
              -- Get the best (MAX) score per chapter to handle edge cases
              -- where a user has multiple attempts on single-trial exams
              SELECT ea.chapter_id, ea.course_id, MAX(ea.score) as score
              FROM users.exam_attempts ea
              WHERE
                ea.exam_type = 'single_trial'
                AND ea.uid = ucp.uid
                AND ea.course_id = ucp.course_id
              GROUP BY ea.chapter_id, ea.course_id
            ) best
            JOIN content.course_chapters_localized ccl
              ON best.chapter_id = ccl.chapter_id AND best.course_id = ccl.course_id
            WHERE ccl.language = cc.original_language
          ), 0)
          +
          COALESCE(ucp.assignment_grade::float  * cc.assignment_weight / 100, 0)
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
    WITH best_chapter_scores AS (
      -- First, get the best (MAX) score per chapter per user
      -- to handle edge cases where a user has multiple attempts on single-trial exams
      SELECT ea.uid, ea.course_id, ea.chapter_id, MAX(ea.score) as score
      FROM users.exam_attempts ea
      WHERE ea.exam_type = 'single_trial'
        AND ea.course_id = ${courseId}
      GROUP BY ea.uid, ea.course_id, ea.chapter_id
    ),
    exam_scores AS (
      SELECT
        best.uid,
        best.course_id,
        ROUND(SUM(best.score::float * ccl.rate_weight / 100)) AS exam_score
      FROM best_chapter_scores best
      JOIN content.course_chapters_localized ccl
        ON best.chapter_id = ccl.chapter_id
        AND best.course_id = ccl.course_id
      JOIN content.courses cc ON best.course_id = cc.id
      WHERE ccl.language = cc.original_language
      GROUP BY best.uid, best.course_id
    ),
    computed_scores AS (
      SELECT
        ucp.uid,
        ucp.course_id,
        COALESCE(es.exam_score, 0) +
        COALESCE(ucp.assignment_grade::float * cc.assignment_weight / 100, 0) AS total_score
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
