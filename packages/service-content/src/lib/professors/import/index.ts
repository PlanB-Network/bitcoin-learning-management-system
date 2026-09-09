import { asTransaction, firstRow, sql } from '@blms/database';
import type { ChangedFile, Professor } from '@blms/types';

import type { Language } from '../../const.js';
import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils.js';

import { createProcessLocalFile } from './local.js';
import { createProcessMainFile } from './main.js';

interface ProfessorDetails {
  path: string;
  fullPath: string;
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
  if (pathElements.length < 2) {
    throw new Error('Invalid professor path');
  }

  return {
    fullPath: pathElements.join('/'),
    language: pathElements[2].replace(/\..*/, '').toLowerCase() as Language,
    path: pathElements.slice(0, 2).join('/'),
  };
};

export const groupByProfessor = (files: ChangedFile[], errors: string[]) => {
  const professorsFiles = files.filter(
    (item) => getContentType(item.path) === 'professors',
  );

  const groupedProfessors = new Map<string, ChangedProfessor>();

  for (const file of professorsFiles) {
    try {
      const {
        path: professorPath,
        language,
        fullPath,
      } = parseDetailsFromPath(file.path);

      const professor: ChangedProfessor = groupedProfessors.get(
        professorPath,
      ) || {
        files: [],
        fullPath: fullPath,
        path: professorPath,
        type: 'professors',
      };

      professor.files.push({
        ...file,
        language,
        path: getRelativePath(file.path, professorPath),
      });

      groupedProfessors.set(professorPath, professor);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedProfessors.values()];
};

export const createUpdateProfessors = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (professor: ChangedProfessor, errors: string[]) => {
    const { main, files } = separateContentFiles(professor, 'professor.yml');

    return postgres
      .begin(async (_tx) => {
        const transaction = asTransaction(_tx);
        const processMainFile = createProcessMainFile(transaction);
        const processLocalFile = createProcessLocalFile(transaction);

        try {
          await processMainFile(professor, main);
        } catch (error) {
          errors.push(
            `Error processing file(professors) ${professor?.fullPath} : ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );
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
            errors.push(
              `Error processing file(professors) ${file?.path}: ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
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

const formatError = (error: unknown) => {
  const detail = (error as { detail?: string }).detail;
  return `${error}${detail ? ` - Detail: ${detail}` : ''}`;
};

export const createDeleteProfessors = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (sync_date: number, errors: string[]) => {
    let stale: Array<{ id: string; name: string }>;

    try {
      stale = await postgres.exec<{ id: string; name: string }>(
        sql`SELECT id, name FROM content.professors WHERE last_sync < ${sync_date}`,
      );
    } catch (error) {
      errors.push(`Error listing professors to delete: ${formatError(error)}`);
      return;
    }

    // Delete one by one: a professor still referenced by a user account or by
    // another table must not prevent the other stale profiles from being removed.
    for (const professor of stale) {
      try {
        await postgres.exec(
          sql`DELETE FROM content.professors WHERE id = ${professor.id}`,
        );
      } catch (error) {
        errors.push(
          `Error deleting professor ${professor.name} (${professor.id}): ${formatError(error)}`,
        );
      }
    }
  };
};
