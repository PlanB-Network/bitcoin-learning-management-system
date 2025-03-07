import { firstRow, sql } from '@blms/database';
import type { ChangedFile, Lab } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils.js';

import { createProcessMainFile } from './main.js';
import { createProcessSessionFile } from './session.js';

interface LabDetails {
  path: string;
  fullPath: string;
}

export type ChangedLab = ChangedContent;

export const createUpdateLabs = ({ postgres }: Dependencies) => {
  return async (lab: ChangedLab, errors: string[]) => {
    const { main, files } = separateContentFiles(lab, 'lab.yml');

    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const processSessionFile = createProcessSessionFile(transaction);

        try {
          const resultLab = await processMainFile(lab, main);
          if (resultLab && files.length > 0) {
            for (const file of files) {
              if (file.path === 'session.md') {
                await processSessionFile(resultLab.id, file);
              }
            }
          }
        } catch (error) {
          errors.push(
            `Error processing file(labs) ${lab?.fullPath} : ${error}`,
          );
        }

        const id = await transaction<Lab[]>`
          SELECT id FROM content.labs WHERE path = ${lab.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(`Lab not found for path ${lab.path}`);
        }
      })
      .catch((error) => {
        errors.push(`Error during transaction: ${error}`);
      });
  };
};

export const createDeleteLabs = ({ postgres }: Dependencies) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`DELETE FROM content.labs WHERE last_sync < ${sync_date}`,
      );
    } catch {
      errors.push('Error deleting labs');
    }
  };
};

export const parseDetailsFromPath = (path: string): LabDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (labs/name)
  if (pathElements.length < 2) {
    throw new Error('Invalid lab path');
  }

  return {
    path: pathElements.slice(0, 2).join('/'),
    fullPath: pathElements.join('/'),
  };
};

export const groupByLab = (files: ChangedFile[], errors: string[]) => {
  const labsFiles = files.filter(
    (item) => getContentType(item.path) === 'labs',
  );

  const groupedLabs = new Map<string, ChangedLab>();

  for (const file of labsFiles) {
    try {
      const { path: labPath, fullPath } = parseDetailsFromPath(file.path);

      const lab: ChangedLab = groupedLabs.get(labPath) || {
        type: 'labs',
        path: labPath,
        fullPath: fullPath,
        files: [],
      };

      lab.files.push({
        ...file,
        path: getRelativePath(file.path, labPath),
      });

      groupedLabs.set(labPath, lab);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedLabs.values()];
};
