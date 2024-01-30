import { firstRow, sql } from '@sovereign-university/database';
import { ChangedFile, Professor } from '@sovereign-university/types';

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

interface ProfessorDetails {
  path: string;
  language?: Language;
}

export type ChangedProfessor = ChangedContent;

/**
 * Parse professor details from path
 *
 * @param path - Path of the file
 * @returns Quiz details
 */
export const parseDetailsFromPath = (path: string): ProfessorDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (professors/name)
  if (pathElements.length < 2) throw new Error('Invalid professor path');

  return {
    path: pathElements.slice(0, 2).join('/'),
    language: pathElements[2].replace(/\..*/, '') as Language,
  };
};

export const groupByProfessor = (files: ChangedFile[], errors: string[]) => {
  const professorsFiles = files.filter(
    (item) => getContentType(item.path) === 'professors',
  );

  const groupedProfessors = new Map<string, ChangedProfessor>();

  for (const file of professorsFiles) {
    try {
      const { path: professorPath, language } = parseDetailsFromPath(file.path);

      const professor: ChangedProfessor = groupedProfessors.get(
        professorPath,
      ) || {
        type: 'professors',
        path: professorPath,
        files: [],
      };

      professor.files.push({
        ...file,
        path: getRelativePath(file.path, professorPath),
        language,
      });

      groupedProfessors.set(professorPath, professor);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return Array.from(groupedProfessors.values());
};

export const createProcessChangedProfessor =
  (dependencies: Dependencies, errors: string[]) =>
  async (professor: ChangedProfessor) => {
    const { postgres } = dependencies;

    const { main, files } = separateContentFiles(professor, 'professor.yml');

    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const processLocalFile = createProcessLocalFile(transaction);

        try {
          await processMainFile(professor, main);
        } catch (error) {
          errors.push(`Error processing file ${professor?.path}: ${error}`);
        }

        const id = await transaction<Professor[]>`
          SELECT id FROM content.professors WHERE path = ${professor.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(`Professor not found for path ${professor.path}`);
        }

        for (const file of files) {
          try {
            await processLocalFile(id, file);
          } catch (error) {
            errors.push(`Error processing file ${file?.path}: ${error}`);
          }
        }
      })
      .catch(() => {
        return;
      });
  };

export const createProcessDeleteProfessors =
  (dependencies: Dependencies, errors: string[]) =>
  async (sync_date: number) => {
    const { postgres } = dependencies;

    try {
      await postgres.exec(
        sql`DELETE FROM content.professors WHERE last_sync < ${sync_date} 
      `,
      );
    } catch (error) {
      errors.push(`Error deleting professors`);
    }

    return;
  };
