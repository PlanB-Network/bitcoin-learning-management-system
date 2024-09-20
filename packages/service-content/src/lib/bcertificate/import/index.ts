import { firstRow, sql } from '@blms/database';
import type { BCertificateExam, ChangedFile } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils.js';

import { createProcessMainFile } from './main.js';
import { createProcessResultFile } from './result.js';

interface BCertificateExamDetails {
  path: string;
  fullPath: string;
}

export type ChangedBCertificateExam = ChangedContent;

export const parseDetailsFromPath = (path: string): BCertificateExamDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (bcert/name)
  if (pathElements.length < 2)
    throw new Error('Invalid B Certificate Exam path');

  return {
    path: pathElements.slice(0, 2).join('/'),
    fullPath: pathElements.join('/'),
  };
};

export const groupByBCertificateExam = (
  files: ChangedFile[],
  errors: string[],
) => {
  const bCertificateExamsFiles = files.filter(
    (item) => getContentType(item.path) === 'bcert',
  );

  const groupedBCertificateExams = new Map<string, ChangedBCertificateExam>();

  for (const file of bCertificateExamsFiles) {
    try {
      const { path: bCertificateExamPath, fullPath } = parseDetailsFromPath(
        file.path,
      );

      const bCertificateExam: ChangedBCertificateExam =
        groupedBCertificateExams.get(bCertificateExamPath) || {
          type: 'bcert',
          path: bCertificateExamPath,
          fullPath: fullPath,
          files: [],
        };

      bCertificateExam.files.push({
        ...file,
        path: getRelativePath(file.path, bCertificateExamPath),
      });

      groupedBCertificateExams.set(bCertificateExamPath, bCertificateExam);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedBCertificateExams.values()];
};

export const createUpdateBCertificateExams = ({ postgres }: Dependencies) => {
  return async (
    bCertificateExam: ChangedBCertificateExam,
    errors: string[],
  ) => {
    const { main, files } = separateContentFiles(bCertificateExam, 'bcert.yml');

    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const processResultFile = createProcessResultFile(transaction);

        try {
          await processMainFile(bCertificateExam, main);
        } catch (error) {
          errors.push(
            `Error processing file(B Certificate Exam) ${bCertificateExam?.fullPath} : ${error}`,
          );
        }

        const id = await transaction<BCertificateExam[]>`
          SELECT id FROM content.b_certificate_exam WHERE path = ${bCertificateExam.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(
            `B Certificate Exam not found for path ${bCertificateExam.path}`,
          );
        }

        for (const file of files) {
          try {
            await processResultFile(id, file);
          } catch (error) {
            errors.push(
              `Error processing file(B Certificate User Result) ${file?.path}: ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};

export const createDeleteBCertificateExams = ({ postgres }: Dependencies) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`DELETE FROM content.b_certificate_exam WHERE last_sync < ${sync_date} 
      `,
      );

      await postgres.exec(
        sql`DELETE FROM users.b_certificate_results WHERE last_sync < ${sync_date} 
      `,
      );
    } catch {
      errors.push(`Error deleting B Certificate Exams`);
    }
  };
};
