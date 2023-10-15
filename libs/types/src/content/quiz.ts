import type { default as Quiz } from '../sql/content/Quizzes';
import type { default as QuizLocalized } from '../sql/content/QuizzesLocalized';

export type { default as Quiz } from '../sql/content/Quizzes';
export type { default as QuizLocalized } from '../sql/content/QuizzesLocalized';

export type JoinedQuiz = Quiz &
  Pick<
    QuizLocalized,
    'language' | 'question' | 'answer' | 'wrong_answers' | 'explanation'
  > & {
    tags: string[];
  };
