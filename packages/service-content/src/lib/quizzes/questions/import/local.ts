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
    id: string,
    file: ChangedFileWithLanguage,
  ) => {
    const parsed = yamlToObject<QuizQuestionLocal>(file.data);

    await transaction`
        INSERT INTO content.quiz_questions_localized (
          quiz_question_id, language, question, answer, wrong_answers, explanation
        )
        VALUES (
          ${id},
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

    await transaction`
        INSERT INTO content.quiz_answers_localized (
          quiz_question_id, "order", language, text
        )
        VALUES (
          ${id},
          0,
          ${file.language},
          ${parsed.answer}
        )
        ON CONFLICT (quiz_question_id, "order", language) DO UPDATE SET
          text = EXCLUDED.text
      `;

    for (let i = 0; i < 3; i++) {
      await transaction`
          INSERT INTO content.quiz_answers_localized (
            quiz_question_id, "order", language, text
          )
          VALUES (
            ${id},
            ${i + 1},
            ${file.language},
            ${parsed.wrong_answers[i]}
          )
          ON CONFLICT (quiz_question_id, "order", language) DO UPDATE SET
            text = EXCLUDED.text
        `;
    }
  };
};
