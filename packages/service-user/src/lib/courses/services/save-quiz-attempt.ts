import type { CourseQuizAttempts } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { insertQuizAttempt } from '../queries/insert-quiz-attempt.js';

interface Options {
  uid: string;
  chapterId: string;
  questionsCount: number;
  correctAnswersCount: number;
}

export const createSaveQuizAttempt = ({ postgres }: Dependencies) => {
  return (options: Options): Promise<CourseQuizAttempts[]> => {
    return postgres.exec(insertQuizAttempt(options));
  };
};
