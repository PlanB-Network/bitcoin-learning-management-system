import type { default as QuizQuestion } from '../sql/content/QuizQuestions';
import type { default as QuizQuestionLocalized } from '../sql/content/QuizQuestionsLocalized';

export type { default as QuizQuestion } from '../sql/content/QuizQuestions';
export type { default as QuizQuestionLocalized } from '../sql/content/QuizQuestionsLocalized';

export type JoinedQuizQuestion = QuizQuestion &
  Pick<
    QuizQuestionLocalized,
    'language' | 'question' | 'answer' | 'wrong_answers' | 'explanation'
  > & {
    tags: string[];
  };
