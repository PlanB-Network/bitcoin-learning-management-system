import { sql } from '@blms/database';
import type { CourseExamAttempt, CourseExamQuestion } from '@blms/types';

export const insertExamAttemptQuery = ({
  uid,
  courseId,
  language,
}: {
  uid: string;
  courseId: string;
  language: string;
}) => {
  return sql<CourseExamAttempt[]>`
    INSERT INTO users.exam_attempts (
      uid, course_id, language, finalized, succeeded, started_at
    ) VALUES (
      ${uid}, ${courseId}, ${language}, false, false, NOW()
    )
    RETURNING id;
  `;
};

export const insertExamQuestionsQuery = ({
  examId,
  courseId,
  language,
}: {
  examId: string;
  courseId: string;
  language: string;
}) => {
  return sql<CourseExamQuestion[]>`
    WITH hard_questions AS (
      SELECT qq.id
      FROM content.quiz_questions qq
      JOIN content.quiz_questions_localized qql
        ON qq.id = qql.quiz_question_id
      WHERE qq.course_id = ${courseId}
      AND qql.language = ${language}
      AND qq.difficulty = 'hard'
      AND qq.disabled = false
      ORDER BY RANDOM()
      LIMIT 20
    ),
    intermediate_questions AS (
      SELECT qq.id
      FROM content.quiz_questions qq
      JOIN content.quiz_questions_localized qql
        ON qq.id = qql.quiz_question_id
      WHERE qq.course_id = ${courseId}
      AND qql.language = ${language}
      AND qq.difficulty = 'intermediate'
      AND qq.disabled = false
      ORDER BY RANDOM()
      LIMIT 15 + GREATEST(0, 20 - (SELECT COUNT(*) FROM hard_questions))
    ),
    easy_questions AS (
      SELECT qq.id
      FROM content.quiz_questions qq
      JOIN content.quiz_questions_localized qql
        ON qq.id = qql.quiz_question_id
      WHERE qq.course_id = ${courseId}
      AND qql.language = ${language}
      AND qq.difficulty = 'easy'
      AND qq.disabled = false
      ORDER BY RANDOM()
      LIMIT 5 + GREATEST(0, (20 - (SELECT COUNT(*) FROM hard_questions)) + (15 - (SELECT COUNT(*) FROM intermediate_questions)))
    ),
    selected_questions AS (
      SELECT id FROM hard_questions
      UNION ALL
      SELECT id FROM intermediate_questions
      UNION ALL
      SELECT id FROM easy_questions
      LIMIT 40
    )
    INSERT INTO users.exam_questions (exam_id, question_id)
    SELECT ${examId}, id
    FROM selected_questions;
  `;
};
