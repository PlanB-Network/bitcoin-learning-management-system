import { sql } from '@sovereign-university/database';
import type { JoinedQuizQuestion } from '@sovereign-university/types';

export const getCourseChapterQuizQuestionsQuery = ({
  courseId,
  partIndex,
  chapterIndex,
  language,
}: {
  courseId: string;
  partIndex: number;
  chapterIndex: number;
  language?: string;
}) => {
  return sql<JoinedQuizQuestion[]>`
    SELECT 
      qq.*, qql.language, qql.question, qql.answer, qql.wrong_answers,
      qql.explanation, ARRAY_AGG(t.name) AS tags
    FROM content.quiz_questions qq
    JOIN content.quiz_questions_localized qql ON qql.quiz_question_id = qq.id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = qq.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE
      qq.course_id = ${courseId}
      AND qq.part = ${partIndex}
      AND qq.chapter = ${chapterIndex}
      ${language ? sql`AND qql.language = ${language}` : sql``}
    GROUP BY qq.id, qql.language, qql.question, qql.answer, qql.wrong_answers, qql.explanation
  `;
};
