import fs from 'node:fs';

import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import {
  createTimestamp,
  createUpgrade,
  createVerify,
  getLatestBlockHash,
  loadPrivateKey,
} from '@blms/opentimestamps';
import type { UserExamTimestamp } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

import { createPdf } from './course-certificate-gen-pdf.js';

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

const formatDate = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  // Determine the correct ordinal suffix for the day
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

  return `${day}${suffix} ${month}, ${year}`;
};

interface ExamAttemptWithUser {
  succeeded: boolean;
  finalized: boolean;
  score: number;
  startedAt: Date;
  finishedAt: Date;
  user: {
    id: string;
    userName: string;
    displayName: string;
  };
  course: {
    id: string;
    level: string;
    goal: string;
    name: string;
    lastCommit: string;
    hours: number;
  };
}

export const createExamTimestampService = async (ctx: Dependencies) => {
  const privateKey = await loadPrivateKey(ctx.config.opentimestamps);

  const timestamp = createTimestamp(privateKey);
  const upgrade = createUpgrade();
  const verify = createVerify({ ignoreBitcoinNode: true });

  const getExamAttempt = (id: string) => {
    return ctx.postgres
      .exec(
        sql<ExamAttemptWithUser[]>`
          SELECT
            a.succeeded,
            a.finalized,
            a.score,
            a.started_at,
            a.finished_at,
            a.language,
            (SELECT jsonb_build_object(
              'id', u.uid,
              'userName', u.username,
              'displayName', u.display_name)
            FROM users.accounts u
            WHERE u.uid = a.uid) AS user,
            (SELECT jsonb_build_object(
              'id', c.id,
              'level', c.level,
              'goal', cl.goal,
              'name', cl.name,
              'hours', c.hours,
              'lastCommit', c.last_commit)
            FROM content.courses c
            JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language =  a.language
            WHERE c.id = a.course_id) AS course
          FROM
            users.exam_attempts a
          WHERE a.id = ${id};
        `,
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };

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

    const lastBlockHash = await getLatestBlockHash();

    const text = getExamAttemptTextToSign({
      userName: exam.user.userName,
      fullName: exam.user.displayName,
      courseName: exam.course.name,
      courseId: exam.course.id,
      level: exam.course.level,
      goal: exam.course.goal,
      duration: `${exam.course.hours} hours`,
      lastCommitHash: exam.course.lastCommit,
      date: formatDate(exam.startedAt),
      lastBlockHash,
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

    if (!exam || !timestamp || !timestamp.confirmed || !timestamp.txId) {
      return null;
    }

    const pdf = await createPdf({
      fullName: exam.user.displayName,
      courseName: exam.course.name,
      courseId: exam.course.id,
      duration: `${exam.course.hours} hours`,
      date: formatDate(exam.startedAt),
      hash: timestamp.hash,
      txid: timestamp.txId,
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
