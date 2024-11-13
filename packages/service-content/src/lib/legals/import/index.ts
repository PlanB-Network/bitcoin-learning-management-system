import matter from 'gray-matter';

import { firstRow, sql } from '@blms/database';
import type { ChangedFile, Legal } from '@blms/types';

import type { Language } from '../../const.js';
import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils.js';

import { createProcessMainFile } from './main.js';

interface LegalDetails {
  path: string;
  fullPath: string;
  language?: Language;
}

export interface ChangedLegal extends ChangedContent {
  path: string;
  name: string;
}

export const parseDetailsFromPath = (path: string): LegalDetails => {
  const pathElements = path.split('/');
  if (pathElements.length < 2) {
    throw new Error('Invalid resource path');
  }

  return {
    path: pathElements.slice(0, -1).join('/'),
    fullPath: pathElements.join('/'),
    language: pathElements
      .at(-1)
      ?.replace(/\..*/, '')
      .toLowerCase() as Language,
  };
};

export const groupByLegal = (files: ChangedFile[], errors: string[]) => {
  const legalFiles = files.filter(
    (item) => getContentType(item.path) === 'legals',
  );
  const groupedLegals = new Map<string, ChangedLegal>();

  for (const file of legalFiles) {
    try {
      const {
        path: legalPath,
        fullPath,
        language,
      } = parseDetailsFromPath(file.path);
      const legal: ChangedLegal = groupedLegals.get(legalPath) || {
        type: 'legals',
        name: legalPath.split('/').at(-1) as string,
        path: legalPath,
        fullPath,
        files: [],
      };
      legal.files.push({
        ...file,
        path: getRelativePath(file.path, legalPath),
        language,
      });
      groupedLegals.set(legalPath, legal);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }
  return [...groupedLegals.values()];
};

export const createUpdateLegals = ({ postgres }: Dependencies) => {
  return async (legal: ChangedLegal, errors: string[]) => {
    const { files } = separateContentFiles(legal, 'post.yml');

    return postgres
      .begin(async (transaction) => {
        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(legal);
        } catch (error) {
          errors.push(
            `Error processing file(legals 1) ${legal?.path}: ${error}`,
          );
          return;
        }

        const id = await transaction<Legal[]>`
          SELECT id FROM content.legals WHERE path = ${legal.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(`Legal data not found for path ${legal.path}`);
        }

        for (const file of files) {
          try {
            if ('data' in file) {
              const header = matter(file.data, { excerpt: false });

              await transaction`
                INSERT INTO content.legals_localized (
                  id, language, title, raw_content
                )
                VALUES (
                  ${id},
                  ${file.language?.toLowerCase()},
                  ${header.data['name']},
                  ${header.content.trim()}
                )
                ON CONFLICT (id, language) DO UPDATE SET
                  title = EXCLUDED.title,
                  raw_content = EXCLUDED.raw_content
              `;
            }
          } catch (error) {
            errors.push(
              `Error processing file(legals 2) ${file?.path} in legal document ${legal.fullPath} : ${error}`,
            );
          }
        }
      })
      .catch((error) => {
        console.error('Error during transaction:', error);
      });
  };
};

export const createDeleteLegals = ({ postgres }: Dependencies) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`DELETE FROM content.legals WHERE last_sync < ${sync_date}`,
      );
    } catch (error) {
      errors.push(`Error deleting legal documents: ${error}`);
    }
  };
};
