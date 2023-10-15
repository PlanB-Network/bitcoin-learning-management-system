import { sql } from '@sovereign-university/database';
import { JoinedQuiz } from '@sovereign-university/types';

export const getCourseChapterQuizzesQuery = ({
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
  return sql<JoinedQuiz[]>`
    SELECT 
      q.*, ql.language, ql.question, ql.answer, ql.wrong_answers,
      ql.explanation, ARRAY_AGG(t.name) AS tags
    FROM content.quizzes q
    JOIN content.quizzes_localized ql ON ql.quiz_id = q.id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = q.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE
      q.course_id = ${courseId}
      AND q.part = ${partIndex}
      AND q.chapter = ${chapterIndex}
      ${language ? sql`AND ql.language = ${language}` : sql``}
    GROUP BY q.id, ql.language, ql.question, ql.answer, ql.wrong_answers, ql.explanation
  `;
};
