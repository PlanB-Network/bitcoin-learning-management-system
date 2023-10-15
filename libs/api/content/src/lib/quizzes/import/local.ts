import { TransactionSql } from '@sovereign-university/database';

import { ChangedFileWithLanguage } from '../../types';
import { yamlToObject } from '../../utils';

import { ChangedQuiz } from '.';

interface QuizLocal {
  question: string;
  answer: string;
  wrong_answers: string[];
  explanation?: string;
}

export const createProcessLocalFile =
  (transaction: TransactionSql) =>
  async (quiz: ChangedQuiz, file: ChangedFileWithLanguage) => {
    if (file.kind === 'removed') {
      // If file was deleted, delete the translation from the database

      await transaction`
        DELETE FROM content.quizzes_localized
        WHERE quiz_id = ${quiz.id} AND language = ${file.language}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      const parsed = yamlToObject<QuizLocal>(file.data);

      await transaction`
        INSERT INTO content.quizzes_localized (
          quiz_id, language, question, answer, wrong_answers, explanation
        )
        VALUES (
          ${quiz.id},
          ${file.language},
          ${parsed.question},
          ${parsed.answer},
          ${parsed.wrong_answers},
          ${parsed.explanation}
        )
        ON CONFLICT (quiz_id, language) DO UPDATE SET
          question = EXCLUDED.question,
          answer = EXCLUDED.answer,
          wrong_answers = EXCLUDED.wrong_answers,
          explanation = EXCLUDED.explanation
      `;
    }
  };
