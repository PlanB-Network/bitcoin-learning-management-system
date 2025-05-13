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
      count(*) as nb_questions,
      is_single_trial_exam,
      start_date,
      end_date
    FROM content.quiz_questions_localized ql
    JOIN content.quiz_questions qq ON qq.id = ql.quiz_question_id
    LEFT JOIN content.course_chapters_localized cl
        ON cl.chapter_id = qq.chapter_id
    WHERE qq.chapter_id = ${chapterId}
      ${language ? sql`AND ql.language = LOWER(${language})` : sql``}
      AND qq.disabled = false
    GROUP BY cl.is_single_trial_exam, cl.start_date, cl.end_date
  `;
};
