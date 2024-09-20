import type { Dependencies } from '../../../dependencies.js';
import { getCourseChapterQuizQuestionsQuery } from '../queries/get-course-chapter-quiz-questions.js';

interface Options {
  chapterId: string;
  language?: string;
}

export const createGetCourseChapterQuizQuestions = ({
  postgres,
}: Dependencies) => {
  return (options: Options) => {
    return postgres.exec(getCourseChapterQuizQuestionsQuery(options));
  };
};
