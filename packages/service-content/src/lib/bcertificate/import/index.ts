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
import {
  createProcessResultFile,
  createProcessTimestampFile,
} from './result.js';

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
    path: pathElements.slice(0, 3).join('/'),
    fullPath: pathElements.join('/'),
  };
};

export const groupByBCertificateExam = (
  files: ChangedFile[],
  errors: string[],
) => {
  const bCertificateExamsFiles = files.filter(
    (item) => getContentType(item.path) === 'bcert/editions',
  );

  const groupedBCertificateExams = new Map<string, ChangedBCertificateExam>();

  for (const file of bCertificateExamsFiles) {
    try {
      const { path: bCertificateExamPath, fullPath } = parseDetailsFromPath(
        file.path,
      );

      const bCertificateExam: ChangedBCertificateExam =
        groupedBCertificateExams.get(bCertificateExamPath) || {
          type: 'bcert/editions',
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

export const createUpdateBCertificateExams = ({
  postgres,
  s3,
}: Dependencies) => {
  return async (
    bCertificateExam: ChangedBCertificateExam,
    errors: string[],
  ) => {
    // eslint-disable-next-line prefer-const
    let { main, files } = separateContentFiles(bCertificateExam, 'bcert.yml');

    // bcert/editions/2024-btc-prague/bcert.yml
    const bcertEdition = bCertificateExam.fullPath
      .split('/')
      .slice(2, 3)
      .join('/');

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
          await processMainFile(bCertificateExam, main);
        } catch (error) {
          errors.push(
            `Error processing file(B Certificate Exam) ${bCertificateExam?.fullPath} : ${error}`,
          );
        }

        const bcertId = await transaction<BCertificateExam[]>`
          SELECT id FROM content.b_certificate_exam WHERE path = ${bCertificateExam.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!bcertId) {
          throw new Error(
            `B Certificate Exam not found for path ${bCertificateExam.path}`,
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
            errors.push(
              `Error processing file(B Certificate OTS file) ${file?.path}: ${error}`,
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
