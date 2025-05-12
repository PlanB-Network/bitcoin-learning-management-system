import { sql } from '@blms/database';
import type { CourseExamInfo } from '@blms/types';

export const getExamInfo = ({
  chapterId,
  language,
}: {
  chapterId: string;
  language: string;
}) => {
  return sql<CourseExamInfo[]>`
    SELECT
      count(*) as nb_questions
    FROM content.quiz_questions_localized ql
    JOIN content.quiz_questions qq ON qq.id = ql.quiz_question_id
    WHERE qq.chapter_id = ${chapterId}
      ${language ? sql`AND ql.language = LOWER(${language})` : sql``}
      AND qq.disabled = false
  `;
};
