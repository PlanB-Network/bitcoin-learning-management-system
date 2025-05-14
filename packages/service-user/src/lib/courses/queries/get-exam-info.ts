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
        COUNT(ql.quiz_question_id) AS nb_questions,
        cl.is_single_trial_exam,
        cl.start_date,
        cl.end_date
    FROM
        content.course_chapters_localized cl
    LEFT JOIN
        content.quiz_questions qq
        ON cl.chapter_id = qq.chapter_id
        AND qq.disabled = FALSE
    LEFT JOIN
        content.quiz_questions_localized ql
        ON qq.id = ql.quiz_question_id
        AND ql.language = cl.language
    WHERE
        cl.chapter_id = ${chapterId}
        ${language ? sql`AND cl.language = LOWER(${language})` : sql``}
    GROUP BY
        cl.chapter_id,
        cl.language,
        cl.is_single_trial_exam,
        cl.start_date,
        cl.end_date;
  `;
};
