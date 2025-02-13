import { firstRow, sql } from '@blms/database';
import type { BCertExam, ChangedFile } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils.js';

import { createProcessMainFile } from './main.js';
import {
  createProcessResultFile,
  createProcessTimestampFile,
} from './result.js';

interface BCertExamDetails {
  path: string;
  fullPath: string;
}

export type ChangedBCertExam = ChangedContent;

export const parseDetailsFromPath = (path: string): BCertExamDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (bcert/name)
  if (pathElements.length < 2)
    throw new Error('Invalid B Certificate Exam path');

  return {
    path: pathElements.slice(0, 3).join('/'),
    fullPath: pathElements.join('/'),
  };
};

export const groupByBCertExam = (files: ChangedFile[], errors: string[]) => {
  const bCertExamsFiles = files.filter(
    (item) => getContentType(item.path) === 'bcert/editions',
  );

  const groupedBCertExams = new Map<string, ChangedBCertExam>();

  for (const file of bCertExamsFiles) {
    try {
      const { path: bCertExamPath, fullPath } = parseDetailsFromPath(file.path);

      const bCertExam: ChangedBCertExam = groupedBCertExams.get(
        bCertExamPath,
      ) || {
        type: 'bcert/editions',
        path: bCertExamPath,
        fullPath: fullPath,
        files: [],
      };

      bCertExam.files.push({
        ...file,
        path: getRelativePath(file.path, bCertExamPath),
      });

      groupedBCertExams.set(bCertExamPath, bCertExam);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedBCertExams.values()];
};

export const createUpdateBCertExams = ({ postgres, s3 }: Dependencies) => {
  return async (bCertExam: ChangedBCertExam, errors: string[]) => {
    const { main, files } = separateContentFiles(bCertExam, 'bcert.yml');

    // bcert/editions/2024-btc-prague/bcert.yml
    const bcertEdition = bCertExam.fullPath.split('/').slice(2, 3).join('/');

    const resultFiles = files.filter((file) =>
      file.path.includes('result.yml'),
    );

    const otsFiles = files.filter(
      (file) =>
        file.path
          .split('/')
          .slice(-1)
          .includes('bitcoin_certificate-signed.pdf') ||
        file.path
          .split('/')
          .slice(-1)
          .includes('bitcoin_certificate-signed.txt') ||
        file.path
          .split('/')
          .slice(-1)
          .includes('bitcoin_certificate-signed.txt.ots'),
    );

    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const processResultFile = createProcessResultFile(transaction);
        const processTimestampFile = createProcessTimestampFile(
          transaction,
          s3,
        );

        try {
          await processMainFile(bCertExam, main);
        } catch (error) {
          errors.push(
            `Error processing file(B Certificate Exam) ${bCertExam?.fullPath} : ${error}`,
          );
        }

        const bcertId = await transaction<BCertExam[]>`
          SELECT id FROM content.b_certificate_exam WHERE path = ${bCertExam.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!bcertId) {
          throw new Error(
            `B Certificate Exam not found for path ${bCertExam.path}`,
          );
        }

        for (const file of resultFiles) {
          try {
            await processResultFile(bcertId, file);
          } catch (error) {
            if (error instanceof Error) {
              if (error.message.includes('uid not found')) {
                // warnings.push(
                //   `Missing uid in B Certificate User Result : ${file?.path}: ${error}`,
                // );
              } else {
                errors.push(
                  `Error processing file(B Certificate User Result) ${file?.path}: ${error}`,
                );
              }
            } else {
              errors.push(
                `Error processing file(B Certificate User Result) ${file?.path}: ${error}`,
              );
            }
          }
        }

        for (const file of otsFiles) {
          try {
            await processTimestampFile(file, bcertEdition, bcertId);
          } catch (error) {
            console.log(
              'Error processing file(B Certificate OTS file) ${file?.path}',
              error,
            );

            errors.push(
              `Error processing file(B Certificate OTS file) ${file?.path}: ${error}`,
            );
          }
        }
      })
      .catch((error) => {
        console.error('Error during transaction:', error);
      });
  };
};

export const createDeleteBCertExams = ({ postgres }: Dependencies) => {
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
      errors.push('Error deleting B Certificate Exams');
    }
  };
};
