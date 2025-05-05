import { sql } from '@blms/database';
import type { QuizQuestionsCount } from '@blms/types';

interface Options {
  chapterId: string;
  language?: string;
}

export const getCourseChapterQuizQuestionsCountQuery = ({
  chapterId,
  language,
}: Options) => {
  return sql<QuizQuestionsCount[]>`
    SELECT
      COUNT(qq.id)::int AS count,
      ${chapterId} AS chapter_id
    FROM content.quiz_questions qq
    ${language ? sql`JOIN content.quiz_questions_localized qql ON qql.quiz_question_id = qq.id` : sql``}
    WHERE
      qq.chapter_id = ${chapterId}
      ${language ? sql`AND qql.language = LOWER(${language})` : sql``}
      AND qq.disabled = false
  `;
};
