import { firstRow } from '@sovereign-university/database';
import { ChangedFile, Quiz } from '@sovereign-university/types';

import { Language } from '../../const';
import { Dependencies } from '../../dependencies';
import { ChangedContent } from '../../types';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils';

import { createProcessLocalFile } from './local';
import { createProcessMainFile } from './main';

interface QuizDetails {
  id: number;
  path: string;
  language?: Language;
}

export interface ChangedQuiz extends ChangedContent {
  id: number;
}

/**
 * Parse quiz details from path
 *
 * @param path - Path of the file
 * @returns Quiz details
 */
export const parseDetailsFromPath = (path: string): QuizDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (quizzes/id)
  if (pathElements.length < 2) throw new Error('Invalid quiz path');

  const id = Number(pathElements[1]);

  if (isNaN(id)) throw new Error('Invalid quiz path');

  return {
    id,
    path: pathElements.slice(0, 2).join('/'),
    language: pathElements[2].replace(/\..*/, '') as Language,
  };
};

export const groupByQuiz = (files: ChangedFile[]) => {
  const quizzesFiles = files.filter(
    (item) => getContentType(item.path) === 'quizzes',
  );

  const groupedQuizzes = new Map<string, ChangedQuiz>();

  for (const file of quizzesFiles) {
    try {
      const { id, path: quizPath, language } = parseDetailsFromPath(file.path);

      const quiz: ChangedQuiz = groupedQuizzes.get(quizPath) || {
        type: 'quizzes',
        id,
        path: quizPath,
        files: [],
      };

      quiz.files.push({
        ...file,
        path: getRelativePath(file.path, quizPath),
        language,
      });

      groupedQuizzes.set(quizPath, quiz);
    } catch {
      console.warn(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return Array.from(groupedQuizzes.values());
};

export const createProcessChangedQuiz =
  (dependencies: Dependencies) => async (quiz: ChangedQuiz) => {
    const { postgres } = dependencies;

    const { main, files } = separateContentFiles(quiz, 'quiz.yml');

    return postgres.begin(async (transaction) => {
      const processMainFile = createProcessMainFile(transaction);
      const processLocalFile = createProcessLocalFile(transaction);

      await processMainFile(quiz, main);

      const id = await transaction<Quiz[]>`
          SELECT id FROM content.quizzes WHERE id = ${quiz.id}
        `
        .then(firstRow)
        .then((row) => row?.id);

      if (!id) {
        throw new Error(
          `Quiz not found for id ${quiz.id} and path ${quiz.path}`,
        );
      }

      for (const file of files) {
        await processLocalFile(quiz, file);
      }
    });
  };
