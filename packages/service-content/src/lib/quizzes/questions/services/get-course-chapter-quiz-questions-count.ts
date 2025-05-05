import type { Dependencies } from '../../../dependencies.js';
import { getCourseChapterQuizQuestionsCountQuery } from '../queries/get-course-chapter-quiz-questions-count.js';

interface Options {
  chapterId: string;
  language?: string;
}

export const createGetCourseChapterQuizQuestionsCount = ({
  postgres,
}: Dependencies) => {
  return (options: Options) => {
    return postgres.exec(getCourseChapterQuizQuestionsCountQuery(options));
  };
};
