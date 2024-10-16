import fs from 'node:fs';

import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import {
  createTimestamp,
  createUpgrade,
  createVerify,
  loadPrivateKey,
} from '@blms/opentimestamps';
import type { UserExamTimestamp } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

import { createPdf } from './course-certificate-gen-pdf.js';

declare function getExamAttempt(id: string): Promise<any>; // TODO

interface TimestampOptions {
  examAttemptId: string;
  text: string;
}

interface VerifyReturn {
  height: number;
  timestamp: number;
}

const textTemplate = fs.readFileSync(
  './pdf/templates/course-certificate-template.txt',
  'utf8',
);

interface CourseCertificateOptions {
  userName: string;
  fullName: string;
  courseName: string;
  courseId: string;
  level: string;
  goal: string;
  duration: string;
  lastCommitHash: string;
  date: string;
  lastBlockHash: string;
}

const getExamAttemptTextToSign = (options: CourseCertificateOptions) => {
  return textTemplate
    .replace('{userName}', options.userName)
    .replace('{fullName}', options.fullName)
    .replace('{courseName}', options.courseName)
    .replace('{courseId}', options.courseId)
    .replace('{level}', options.level)
    .replace('{goal}', options.goal)
    .replace('{duration}', options.duration)
    .replace('{lastCommitHash}', options.lastCommitHash)
    .replace('{date}', options.date)
    .replace('{lastBlockHash}', options.lastBlockHash);
};

export const createExamTimestampService = async (ctx: Dependencies) => {
  const privateKey = await loadPrivateKey(ctx.config.opentimestamps);

  const timestamp = createTimestamp(privateKey);
  const upgrade = createUpgrade();
  const verify = createVerify({ ignoreBitcoinNode: true });

  const getExamTimestamp = (id: string): Promise<UserExamTimestamp> => {
    return ctx.postgres
      .exec(
        sql<UserExamTimestamp[]>`
          SELECT * FROM users.exam_timestamps
          WHERE exam_attempt_id = ${id}
        `,
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };

  const verifyExamTimestamp = (examAttemptId: string) => {
    return getExamTimestamp(examAttemptId) //
      .then(({ hash, ots }) => verify(ots, hash))
      .then((res: VerifyReturn | null) => res);
  };

  const validateExamTimestamp = (examAttemptId: string) => {
    return verifyExamTimestamp(examAttemptId) //
      .then((res) => {
        if (!res) {
          return null;
        }

        return ctx.postgres.exec(
          sql<UserExamTimestamp[]>`
              UPDATE users.exam_timestamps
              SET height = ${res.height},
                  timestamp = ${res.timestamp},
                  confirmed = true,
                  confirmed_at = NOW()
              WHERE exam_attempt_id = ${examAttemptId}
            `,
        );
      })
      .then((res) => !!res);
  };

  const upgradeAndValidate = (examAttemptId: string) => {
    return getExamTimestamp(examAttemptId) //
      .then(({ ots }) => upgrade(ots))
      .then((ots) => {
        if (!ots) {
          return null;
        }

        // Save the upgraded ots
        return ctx.postgres.exec(
          sql<UserExamTimestamp[]>`
              UPDATE users.exam_timestamps
              SET ots = ${ots}
              WHERE exam_attempt_id = ${examAttemptId}
            `,
        );
      })
      .then((ots) => {
        if (!ots) {
          return null;
        }

        // Save the upgraded ots
        return validateExamTimestamp(examAttemptId);
      })
      .then((res) => !!res);
  };

  const timestampExamAttempt = async ({ examAttemptId }: TimestampOptions) => {
    const exam = await getExamAttempt(examAttemptId);
    if (!exam) {
      return false;
    }

    const text = getExamAttemptTextToSign({
      userName: exam.user_name,
      fullName: exam.full_name,
      courseName: exam.course_name,
      courseId: exam.course_id,
      level: exam.level,
      goal: exam.goal,
      duration: exam.duration,
      lastCommitHash: exam.last_commit_hash,
      date: exam.date,
      lastBlockHash: exam.last_block_hash,
    });

    const { signature, ots, hash } = await timestamp({ text });

    await ctx.postgres.exec(
      sql<UserExamTimestamp[]>`
        INSERT INTO users.exam_timestamps (exam_attempt_id, txt, sig, hash, ots)
        VALUES (${examAttemptId}, ${text}, ${signature}, ${hash}, ${ots})
        RETURNING
      `,
    );

    return true;
  };

  const generatePdfCertificate = async (examAttemptId: string) => {
    const exam = await getExamAttempt(examAttemptId);
    const timestamp = await getExamTimestamp(examAttemptId);

    if (!exam || !timestamp || !timestamp.confirmed || !timestamp.txid) {
      return null;
    }

    const pdf = await createPdf({
      fullName: exam.full_name,
      courseName: exam.course_name,
      courseId: exam.course_id,
      duration: exam.duration,
      date: exam.date,
      hash: timestamp.hash,
      txid: timestamp.txid,
    });

    const fileKey = `certificates/${examAttemptId}.pdf`;
    await ctx.s3.put(fileKey, pdf, 'application/pdf');

    return true;
  };

  const getPdfCertificate = async (examAttemptId: string, stream?: boolean) => {
    const timestamp = await getExamTimestamp(examAttemptId);

    // No chance the pdf exists if the timestamp is not confirmed
    if (!timestamp || !timestamp.confirmed) {
      return null;
    }

    const fileKey = `certificates/${examAttemptId}.pdf`;

    if (stream) {
      return ctx.s3.getStream(fileKey);
    }

    return ctx.s3.getBlob(fileKey);
  };

  return {
    //
    getExamTimestamp,
    getPdfCertificate,
    //
    timestampExamAttempt,
    upgradeAndValidate,
    verifyExamTimestamp,
    generatePdfCertificate,
  };
};
