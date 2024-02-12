import type { default as QuizQuestion } from '../sql/content/QuizQuestions.js';
import type { default as QuizQuestionLocalized } from '../sql/content/QuizQuestionsLocalized.js';

export type { default as QuizQuestion } from '../sql/content/QuizQuestions.js';
export type { default as QuizQuestionLocalized } from '../sql/content/QuizQuestionsLocalized.js';
export type { default as QuizAttempt } from '../sql/users/QuizAttempts.js';

export type JoinedQuizQuestion = QuizQuestion &
  Pick<
    QuizQuestionLocalized,
    'language' | 'question' | 'answer' | 'wrong_answers' | 'explanation'
  > & {
    tags: string[];
  };
