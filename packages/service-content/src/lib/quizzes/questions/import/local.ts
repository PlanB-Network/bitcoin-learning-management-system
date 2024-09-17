import type { TransactionSql } from '@blms/database';

import type { ChangedFileWithLanguage } from '../../../types.js';
import { yamlToObject } from '../../../utils.js';

import type { ChangedQuizQuestion } from './index.js';

interface QuizQuestionLocal {
  question: string;
  answer: string;
  wrong_answers: string[];
  explanation?: string;
}

export const createProcessLocalFile = (transaction: TransactionSql) => {
  return async (
    quizQuestion: ChangedQuizQuestion,
    file: ChangedFileWithLanguage,
  ) => {
    if (file.kind === 'removed') {
      return;
    }

    const parsed = yamlToObject<QuizQuestionLocal>(file.data);

    await transaction`
        INSERT INTO content.quiz_questions_localized (
          quiz_question_id, language, question, answer, wrong_answers, explanation
        )
        VALUES (
          ${quizQuestion.id},
          ${file.language},
          ${parsed.question},
          ${parsed.answer},
          ${parsed.wrong_answers},
          ${parsed.explanation}
        )
        ON CONFLICT (quiz_question_id, language) DO UPDATE SET
          question = EXCLUDED.question,
          answer = EXCLUDED.answer,
          wrong_answers = EXCLUDED.wrong_answers,
          explanation = EXCLUDED.explanation
      `;
  };
};
