import { sql } from '@blms/database';
import type { JoinedQuizQuestion } from '@blms/types';

interface Options {
  chapterId: string;
  language?: string;
}

export const getCourseChapterQuizQuestionsQuery = ({
  chapterId,
  language,
}: Options) => {
  return sql<JoinedQuizQuestion[]>`
    SELECT 
      qq.*, qql.language, qql.question, qql.answer, qql.wrong_answers,
      qql.explanation,ARRAY[]::text[] AS tags
    FROM content.quiz_questions qq
    JOIN content.quiz_questions_localized qql ON qql.quiz_question_id = qq.id
    WHERE
      qq.chapter_id = ${chapterId}
      ${language ? sql`AND qql.language = ${language}` : sql``}
      AND qq.disabled = false
    GROUP BY qq.id, qql.language, qql.question, qql.answer, qql.wrong_answers, qql.explanation
  `;
};
