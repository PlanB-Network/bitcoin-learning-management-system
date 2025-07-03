import { sql } from '@blms/database';
import type { ChangedFile } from '@blms/types';

import type { Language } from '../../../const.js';
import type { Dependencies } from '../../../dependencies.js';
import type { ChangedContent } from '../../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../../utils.js';

import { createProcessLocalFile } from './local.js';
import { createProcessMainFile } from './main.js';

interface QuizQuestionDetails {
  id: string;
  path: string;
  fullPath: string;
  language?: Language;
}

export interface ChangedQuizQuestion extends ChangedContent {
  id: string;
}

/**
 * Parse quiz question details from path
 *
 * @param path - Path of the file
 * @returns Quiz details
 */
export const parseDetailsFromPath = (path: string): QuizQuestionDetails => {
  const pathElements = path.split('/');

  if (pathElements.length < 4) {
    throw new Error('Invalid quiz question path');
  }

  const id = `${pathElements[1]}-${pathElements[3]}`;

  return {
    fullPath: pathElements.join('/'),
    id,
    language: pathElements[4].replace(/\..*/, '').toLowerCase() as Language,
    path: pathElements.slice(0, 4).join('/'),
  };
};

export const groupByQuizQuestion = (files: ChangedFile[], errors: string[]) => {
  const quizQuestionsFiles = files.filter(
    (item) =>
      getContentType(item.path) === 'courses' && item.path.includes('/quizz/'),
  );

  const groupedQuizQuestions = new Map<string, ChangedQuizQuestion>();

  for (const file of quizQuestionsFiles) {
    try {
      const {
        id,
        path: quizQuestionPath,
        fullPath,
        language,
      } = parseDetailsFromPath(file.path);

      const quizQuestion: ChangedQuizQuestion = groupedQuizQuestions.get(
        quizQuestionPath,
      ) || {
        files: [],
        fullPath,
        id,
        path: quizQuestionPath,
        type: 'quizzes/questions',
      };

      quizQuestion.files.push({
        ...file,
        fullPath: file.path,
        language,
        path: getRelativePath(file.path, quizQuestionPath),
      });

      groupedQuizQuestions.set(quizQuestionPath, quizQuestion);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedQuizQuestions.values()];
};

export const createUpdateQuizQuestions = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (quizQuestion: ChangedQuizQuestion, errors: string[]) => {
    const { main, files } = separateContentFiles(quizQuestion, 'question.yml');

    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const processLocalFile = createProcessLocalFile(transaction);

        let id: any;

        try {
          id = await processMainFile(quizQuestion, main);
        } catch (error) {
          errors.push(
            `Error processing file(quiz) ${quizQuestion?.fullPath} for quiz question ${quizQuestion.id}: ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );
          return;
        }

        if (!id) {
          // For test-only courses, we don't want to throw an error
          return;
        }

        for (const file of files) {
          try {
            await processLocalFile(id, file);
          } catch (error) {
            errors.push(
              `Error processing file(quiz2) ${file.path} for quiz question ${quizQuestion.id}: ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
            );
            return;
          }
        }
      })
      .catch((error) => {
        errors.push(`Error during transaction: ${error}`);
      });
  };
};

export const createDisableQuizQuestions = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`UPDATE content.quiz_questions SET disabled = true WHERE last_sync < ${sync_date}`,
      );
    } catch {
      errors.push('Error disabling quiz_questions');
    }
  };
};
