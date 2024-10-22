import { sql } from '@blms/database';
import type {
  CourseExamAttempt,
  CourseExamResults,
  CourseSuccededExam,
  PartialExamQuestion,
} from '@blms/types';

export const getPartialExamQuestionsQuery = ({
  examId,
  language,
}: {
  examId: string;
  language: string;
}) => {
  return sql<PartialExamQuestion[]>`
    SELECT
      eq.id AS id,
      qql.question AS text,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'order', qal.order,
            'text', qal.text
          )
          ORDER BY qal.text
        ) FILTER (WHERE qal.order IS NOT NULL),
        '[]'::json
      ) AS answers
    FROM users.exam_questions eq
    INNER JOIN content.quiz_questions qq ON eq.question_id = qq.id
    INNER JOIN content.quiz_questions_localized qql ON qq.id = qql.quiz_question_id
    LEFT JOIN content.quiz_answers qa ON qq.id = qa.quiz_question_id
    LEFT JOIN content.quiz_answers_localized qal ON qa.quiz_question_id = qal.quiz_question_id
      AND qa."order" = qal."order"
    WHERE eq.exam_id = ${examId}
      AND qql.language = ${language}
      AND qal.language = ${language}
    GROUP BY eq.id, qql.question
    ORDER BY eq.id;
  `;
};

export const getLatestExamAttemptIdQuery = ({
  uid,
  courseId,
}: {
  uid: string;
  courseId: string;
}) => {
  return sql<CourseExamAttempt[]>`
    SELECT id
    FROM users.exam_attempts
    WHERE uid = ${uid}
      AND course_id = ${courseId}
    ORDER BY started_at DESC
    LIMIT 1;
  `;
};

export const getExamResultsQuery = ({ examId }: { examId: string }) => {
  return sql<CourseExamResults[]>`
    SELECT
      jsonb_agg(
          jsonb_build_object(
              'text', ql.question,
              'explanation', ql.explanation,
              'chapterName', ccl.title,
              'chapterPart', cp.part_index,
              'chapterIndex', cc.chapter_index,
              'chapterLink', CONCAT('/courses/', cc.course_id, '/', cc.chapter_id),
              'userAnswer', uea.order,
              'answers', (
                  SELECT jsonb_agg(
                      jsonb_build_object(
                          'text', qal.text,
                          'order', qal."order",
                          'correctAnswer', qa.correct
                      )
                      ORDER BY qal.text
                  )
                  FROM content.quiz_answers qa
                  JOIN content.quiz_answers_localized qal
                  ON qa.quiz_question_id = qal.quiz_question_id
                  AND qa."order" = qal."order"
                  WHERE qa.quiz_question_id = q.id
                  AND qal.language = ea.language
              )
          )
        ORDER BY eq.id
      ) AS questions,
      ea.succeeded,
      ea.finalized,
      ea.score,
      ea.started_at,
      ea.finished_at,
      ea.id
    FROM
      users.exam_questions eq
    JOIN content.quiz_questions q ON eq.question_id = q.id
    JOIN content.quiz_questions_localized ql ON q.id = ql.quiz_question_id
    JOIN content.course_chapters cc ON q.chapter_id = cc.chapter_id
    JOIN content.course_chapters_localized ccl ON cc.chapter_id = ccl.chapter_id
    JOIN content.course_parts cp ON cc.part_id = cp.part_id
    LEFT JOIN users.exam_answers uea ON eq.id = uea.question_id
    JOIN users.exam_attempts ea ON eq.exam_id = ea.id
    WHERE eq.exam_id = ${examId}
    AND ql.language = ea.language
    AND ccl.language = ea.language
    GROUP BY
      ea.id, ea.score, ea.finalized, ea.succeeded, ea.started_at, ea.finished_at;
  `;
};

export const getAllUserSuccededExamsQuery = ({
  courseId,
  uid,
  language,
}: {
  courseId?: string;
  uid: string;
  language?: string;
}) => {
  return sql<CourseSuccededExam[]>`
    SELECT
      ea.succeeded,
      ea.finalized,
      ea.score,
      ea.started_at,
      ea.finished_at,
      ea.course_id,
      cl.name as course_name
    FROM
      users.exam_questions eq
    JOIN users.exam_attempts ea ON eq.exam_id = ea.id
    JOIN content.courses c ON c.id = ea.course_id
    JOIN content.courses_localized cl ON c.id = cl.course_id
    WHERE ea.uid = ${uid}
      AND ea.succeeded = true
      AND ea.finalized = true
      ${courseId ? sql`AND ea.course_id = ${courseId}` : sql``}
      ${language ? sql`AND cl.language = ${language}` : sql``}
    GROUP BY
      ea.id, ea.score, ea.finalized, ea.succeeded, ea.started_at, ea.finished_at, cl.name;
  `;
};

export const getAllUserCourseExamsResultsQuery = ({
  courseId,
  uid,
}: {
  courseId?: string;
  uid: string;
}) => {
  return sql<CourseExamResults[]>`
    SELECT
      jsonb_agg(
          jsonb_build_object(
              'text', ql.question,
              'explanation', ql.explanation,
              'chapterName', ccl.title,
              'chapterPart', cp.part_index,
              'chapterIndex', cc.chapter_index,
              'chapterLink', CONCAT('/courses/', cc.course_id, '/', cc.chapter_id),
              'userAnswer', uea.order,
              'answers', (
                  SELECT jsonb_agg(
                      jsonb_build_object(
                          'text', qal.text,
                          'order', qal."order",
                          'correctAnswer', qa.correct
                      )
                      ORDER BY qal.text
                  )
                  FROM content.quiz_answers qa
                  JOIN content.quiz_answers_localized qal
                  ON qa.quiz_question_id = qal.quiz_question_id
                  AND qa."order" = qal."order"
                  WHERE qa.quiz_question_id = q.id
                  AND qal.language = ea.language
              )
          )
        ORDER BY eq.id
      ) AS questions,
      ea.succeeded,
      ea.finalized,
      ea.score,
      ea.started_at,
      ea.finished_at,
      ea.id
    FROM
      users.exam_questions eq
    JOIN content.quiz_questions q ON eq.question_id = q.id
    JOIN content.quiz_questions_localized ql ON q.id = ql.quiz_question_id
    JOIN content.course_chapters cc ON q.chapter_id = cc.chapter_id
    JOIN content.course_chapters_localized ccl ON cc.chapter_id = ccl.chapter_id
    JOIN content.course_parts cp ON cc.part_id = cp.part_id
    LEFT JOIN users.exam_answers uea ON eq.id = uea.question_id
    JOIN users.exam_attempts ea ON eq.exam_id = ea.id
    WHERE ea.uid = ${uid}
     ${courseId ? sql`AND ea.course_id = ${courseId}` : sql``}
    AND ea.finalized = true
    AND ql.language = ea.language
    AND ccl.language = ea.language
    GROUP BY
      ea.id, ea.score, ea.finalized, ea.succeeded, ea.started_at, ea.finished_at;
  `;
};

export const getCorrectAnswersCountQuery = ({ examId }: { examId: string }) => {
  return sql`
        SELECT
            COUNT(*) AS correct_answers
        FROM users.exam_answers ea
        INNER JOIN users.exam_questions eq ON ea.question_id = eq.id
        INNER JOIN content.quiz_answers qa ON eq.question_id = qa.quiz_question_id
            AND ea."order" = qa."order"
        WHERE eq.exam_id = ${examId}
            AND qa.correct = true;
    `;
};

export const getExamQuestionsCountQuery = ({ examId }: { examId: string }) => {
  return sql`
        SELECT
            COUNT(*) AS questions_count
        FROM users.exam_questions
        WHERE exam_id = ${examId};
    `;
};

export const getExamIdFromQuestionIdQuery = ({
  questionId,
}: {
  questionId: string;
}) => {
  return sql`
        SELECT exam_id
        FROM users.exam_questions
        WHERE id = ${questionId}
        LIMIT 1;
    `;
};
