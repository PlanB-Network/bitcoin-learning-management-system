import { TransactionSql } from '@sovereign-university/database';

import { ChangedFileWithLanguage } from '../../../types';
import { yamlToObject } from '../../../utils';

import { ChangedQuizQuestion } from '.';

interface QuizQuestionLocal {
  question: string;
  answer: string;
  wrong_answers: string[];
  explanation?: string;
}

export const createProcessLocalFile =
  (transaction: TransactionSql) =>
  async (quizQuestion: ChangedQuizQuestion, file: ChangedFileWithLanguage) => {
    if (file.kind === 'removed') {
      // If file was deleted, delete the translation from the database

      await transaction`
        DELETE FROM content.quiz_questions_localized
        WHERE quiz_question_id = ${quizQuestion.id} AND language = ${file.language}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
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
    }
  };
