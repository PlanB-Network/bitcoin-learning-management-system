import fs from 'node:fs';
import { join } from 'node:path';

import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import {
  createTimestamp,
  createUpgrade,
  createVerify,
  getBlockHashFromHeight,
  getLatestBlockHash,
  loadPrivateKey,
} from '@blms/opentimestamps';
import type { UserExamTimestamp } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

import { createPdf } from './course-certificate-gen-pdf.js';
import { createPngFromFirstPage } from './course-certificate-gen-png.js';

interface TimestampOptions {
  examAttemptId: string;
}

interface VerifyReturn {
  height: number;
  timestamp: number;
}

const textTemplate = fs.readFileSync(
  join(import.meta.dirname, './pdf/templates/course-certificate-template.txt'),
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

  return `${month} ${day}, ${year}`;
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
  if (!privateKey) {
    console.warn(
      'No private key found for OpenTimestamps, timestamps will not be available',
    );

    return null;
  }

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
          WHERE exam_attempt_id = ${id};
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

  const validateExamTimestamp = async (examAttemptId: string) => {
    const res = await verifyExamTimestamp(examAttemptId); //
    if (!res) {
      return null;
    }

    const blockHash = await getBlockHashFromHeight(res.height);

    const ok = await ctx.postgres.exec(
      sql<UserExamTimestamp[]>`
        UPDATE users.exam_timestamps
        SET block_timestamp = ${res.timestamp},
            block_height = ${res.height},
            block_hash = ${blockHash},
            confirmed = true,
            confirmed_at = NOW()
        WHERE exam_attempt_id = ${examAttemptId};
      `,
    );

    return !!ok;
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
      });
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
        RETURNING *;
      `,
    );

    return true;
  };

  const generatePdfCertificate = async (examAttemptId: string) => {
    const exam = await getExamAttempt(examAttemptId);
    const timestamp = await getExamTimestamp(examAttemptId);

    if (!exam || !timestamp || !timestamp.confirmed || !timestamp.blockHash) {
      return null;
    }

    const pdf = await createPdf({
      fullName: exam.user.displayName,
      courseName: exam.course.name,
      courseId: exam.course.id,
      duration: `${exam.course.hours} hours`,
      date: formatDate(exam.startedAt),
      hash: timestamp.hash,
      txid: timestamp.blockHash,
    });

    const fileKey = `certificates/${examAttemptId}.pdf`;
    await ctx.s3.put(fileKey, pdf, 'application/pdf');

    await ctx.postgres.exec(
      sql<UserExamTimestamp[]>`
        UPDATE users.exam_timestamps
        SET pdf_key = ${fileKey}
        WHERE exam_attempt_id = ${examAttemptId};
      `,
    );

    return true;
  };

  const generateCertificateThumbnail = async (
    examAttemptId: string,
    pdfKey: string,
  ) => {
    const pdf = await ctx.s3.getBlob(pdfKey);
    if (!pdf) {
      console.warn('No pdf found for', pdfKey);
      return null;
    }

    const fileKey = `certificates/${examAttemptId}.png`;
    const thumbnail = await createPngFromFirstPage(pdf);
    if (!thumbnail) {
      console.warn('No thumbnail found for', pdfKey);
      return null;
    }

    await ctx.s3.put(fileKey, thumbnail, 'image/png');

    await ctx.postgres.exec(
      sql<UserExamTimestamp[]>`
        UPDATE users.exam_timestamps
        SET img_key = ${fileKey}
        WHERE exam_attempt_id = ${examAttemptId};
      `,
    );

    return true;
  };

  const getPdfCertificate = async (examAttemptId: string, stream?: boolean) => {
    const timestamp = await getExamTimestamp(examAttemptId);
    if (!timestamp || !timestamp.pdfKey) {
      return null;
    }

    const fileKey = `certificates/${examAttemptId}.pdf`;

    if (stream) {
      return ctx.s3.getStream(fileKey);
    }

    return ctx.s3.getBlob(fileKey);
  };

  const getPngCertificate = async (examAttemptId: string, stream?: boolean) => {
    const timestamp = await getExamTimestamp(examAttemptId);
    if (!timestamp || !timestamp.imgKey) {
      return null;
    }

    const fileKey = `certificates/${examAttemptId}.png`;
    if (stream) {
      return ctx.s3.getStream(fileKey);
    }

    return ctx.s3.getBlob(fileKey);
  };

  return {
    //
    getExamTimestamp,
    getPdfCertificate,
    getPngCertificate,
    getOpenTimestampFile: async (examAttemptId: string) => {
      const timestamp = await getExamTimestamp(examAttemptId);
      if (!timestamp) {
        return null;
      }

      return timestamp.ots as Buffer;
    },
    //
    timestampExamAttempt,
    upgradeAndValidate,
    verifyExamTimestamp,
    generatePdfCertificate,
    //
    timestampAllExams: async () => {
      const exams = await ctx.postgres.exec(
        sql<Array<{ id: string }>>`
          SELECT a.id
          FROM users.exam_attempts a
          LEFT JOIN users.exam_timestamps t ON a.id = t.exam_attempt_id
          WHERE t.exam_attempt_id IS NULL
            AND a.finalized = true
            AND a.succeeded = true;
        `,
      );

      console.log('Timestamp all exams', exams);

      for (const { id } of exams) {
        await timestampExamAttempt({ examAttemptId: id });
      }
    },
    upgradeAllTimeStamps: async () => {
      const timestamps = await ctx.postgres.exec(
        sql<Array<{ examAttemptId: string }>>`
          SELECT exam_attempt_id
          FROM users.exam_timestamps
          WHERE confirmed = false;
        `,
      );

      console.log('Upgrade all timestamps', timestamps);

      for (const { examAttemptId } of timestamps) {
        await upgradeAndValidate(examAttemptId);
      }
    },
    generateAllCertificates: async () => {
      const timestamps = await ctx.postgres.exec(
        sql<Array<{ examAttemptId: string }>>`
          SELECT exam_attempt_id
          FROM users.exam_timestamps
          WHERE confirmed = true
            AND pdf_key IS NULL;
        `,
      );

      console.log('Generate all certificates', timestamps);

      for (const { examAttemptId } of timestamps) {
        await generatePdfCertificate(examAttemptId);
      }
    },
    generateAllThumbnails: async () => {
      const docs = await ctx.postgres.exec(
        sql<Array<{ examAttemptId: string; pdfKey: string }>>`
          SELECT exam_attempt_id, pdf_key
          FROM users.exam_timestamps
          WHERE pdf_key IS NOT NULL
            AND img_key IS NULL;
        `,
      );

      console.log('Generate all certificates thumbnails', docs);

      for (const { examAttemptId, pdfKey } of docs) {
        await generateCertificateThumbnail(examAttemptId, pdfKey);
      }
    },
  };
};
