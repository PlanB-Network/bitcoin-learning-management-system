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

import { loadTxtTemplate } from '../../pdf/utils.js';

import { createPdf } from './course-certificate-gen-pdf.js';

import type { CourseFormat } from '@blms/constants';
import { pdfThumbnail } from '@blms/service-common';
import { createTeacherLedCertificatePdf } from './teacher-led-courses-gen-pdf.js';

interface CourseProgressKey {
  uid: string;
  courseId: string;
}

interface TimestampOptions {
  examAttemptId: string;
}

interface VerifyReturn {
  height: number;
  timestamp: number;
}

const textTemplate = loadTxtTemplate('course-certificate-template');
const singleTrialTemplate = loadTxtTemplate(
  'teacher-led-courses-certificate-template',
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

const getSingleTrialExamTextToSign = (
  options: CourseCertificateOptions & { score: number; courseProvider: string },
) => {
  return singleTrialTemplate
    .replace('{userName}', options.userName)
    .replace('{fullName}', options.fullName)
    .replaceAll('{courseName}', options.courseName)
    .replace('{courseId}', options.courseId)
    .replace('{level}', options.level)
    .replace('{goal}', options.goal)
    .replace('{duration}', options.duration)
    .replace('{lastCommitHash}', options.lastCommitHash)
    .replace('{date}', options.date)
    .replace('{lastBlockHash}', options.lastBlockHash)
    .replace('{courseProvider}', options.courseProvider)
    .replace('{score}', `${options.score}`);
};

const formatDate = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    index: string;
    level: string;
    goal: string;
    name: string;
    format: CourseFormat;
    lastCommit: string;
    hours: number;
  };
}

interface CourseProgressWithUser
  extends Pick<ExamAttemptWithUser, 'user' | 'course'> {
  projectName: string;
  totalScore: number;
  startDate: Date;
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
              'index', c.index,
              'level', c.level,
              'format', c.format,
              'goal', COALESCE(cl_en.goal, cl_orig.goal),
              'name', COALESCE(cl_en.name, cl_orig.name),
              'hours', c.hours,
              'lastCommit', c.last_commit)
            FROM content.courses c
            JOIN content.courses_localized cl_en ON c.id = cl_en.course_id AND cl_en.language = 'en'
            JOIN content.courses_localized cl_orig ON c.id = cl_orig.course_id AND cl_orig.language = a.language
            WHERE c.id = a.course_id) AS course
          FROM
            users.exam_attempts a
          WHERE a.id = ${id};
        `,
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };

  const getCourseProgress = (key: CourseProgressKey) => {
    return ctx.postgres
      .exec(
        sql<CourseProgressWithUser[]>`
          SELECT
            cp.total_score,
            cp.start_date,
            p.name as project_name,
            (SELECT jsonb_build_object(
              'id', u.uid,
              'userName', u.username,
              'displayName', u.display_name)
            FROM users.accounts u
            WHERE u.uid = cp.uid) AS user,
            (SELECT jsonb_build_object(
              'id', c.id,
              'index', c.index,
              'level', c.level,
              'format', c.format,
              'goal', COALESCE(cl_en.goal, cl_orig.goal),
              'name', COALESCE(cl_en.name, cl_orig.name),
              'hours', c.hours,
              'lastCommit', c.last_commit)
            FROM content.courses c
            JOIN content.courses_localized cl_en ON c.id = cl_en.course_id AND cl_en.language = 'en'
            JOIN content.courses_localized cl_orig ON c.id = cl_orig.course_id AND cl_orig.language = c.original_language
            WHERE c.id = cp.course_id) AS course
          FROM
            users.course_progress cp
          JOIN content.courses c ON cp.course_id = c.id
          JOIN content.projects p ON c.project_id = p.id
          WHERE cp.uid = ${key.uid} AND cp.course_id = ${key.courseId};
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
          WHERE id = ${id};
        `,
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };

  const verifyExamTimestamp = (id: string) => {
    return getExamTimestamp(id) //
      .then(({ hash, ots }) => verify(ots, hash))
      .then((res: VerifyReturn | null) => res);
  };

  const validateExamTimestamp = async (id: string) => {
    const res = await verifyExamTimestamp(id); //
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
        WHERE id = ${id};
      `,
    );

    return !!ok;
  };

  const upgradeExamTimestamp = (id: string) => {
    return getExamTimestamp(id) //
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
              WHERE id = ${id}
            `,
        );
      });
  };

  const timestampFinalExamAttempt = async ({
    examAttemptId,
  }: TimestampOptions) => {
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

  const timestampSingleTrialExamAttempt = async (key: CourseProgressKey) => {
    const cp = await getCourseProgress(key);
    if (!cp) {
      return false;
    }

    const lastBlockHash = await getLatestBlockHash();

    const text = getSingleTrialExamTextToSign({
      userName: cp.user.userName,
      fullName: cp.user.displayName,
      courseName: cp.course.name,
      courseId: cp.course.id,
      level: cp.course.level,
      goal: cp.course.goal,
      duration: `${cp.course.hours} hours`,
      lastCommitHash: cp.course.lastCommit,
      date: formatDate(cp.startDate),
      lastBlockHash,
      score: cp.totalScore,
      courseProvider: 'Plan ₿ Network',
    });

    const { signature, ots, hash } = await timestamp({ text });

    const ts = await ctx.postgres.exec(
      sql<UserExamTimestamp[]>`
        INSERT INTO users.exam_timestamps (uid, course_id, txt, sig, hash, ots)
        VALUES (${key.uid}, ${key.courseId}, ${text}, ${signature}, ${hash}, ${ots})
        RETURNING *;
      `,
    );

    console.log('Timestamped single trial exam', ts);

    return true;
  };

  const generatePdfCertificate = async (id: string) => {
    const timestamp = await getExamTimestamp(id);

    let pdf = null;

    if (timestamp.examAttemptId) {
      const exam = await getExamAttempt(id);

      if (!exam || !timestamp || !timestamp.confirmed || !timestamp.blockHash) {
        return null;
      }

      pdf = await createPdf({
        fullName: exam.user.displayName,
        courseName: exam.course.name,
        courseIndex: exam.course.index,
        duration: `${exam.course.hours} hours`,
        date: formatDate(exam.startedAt),
        hash: timestamp.hash,
        txid: timestamp.blockHash,
      });
    }

    //
    else if (timestamp.uid && timestamp.courseId) {
      const cp = await getCourseProgress({
        uid: timestamp.uid,
        courseId: timestamp.courseId,
      });

      if (!cp || !timestamp || !timestamp.confirmed || !timestamp.blockHash) {
        return null;
      }

      pdf = await createTeacherLedCertificatePdf({
        fullName: cp.user.displayName,
        courseName: cp.course.name,
        courseFormat: cp.course.format,
        courseProvider: cp.projectName,
        courseProviderLogo: `https://planb.network/cdn/courses/${cp.course.index}/assets/thumbnail.webp`,
        date: formatDate(cp.startDate),
        hash: timestamp.hash,
        txid: timestamp.blockHash,
      });
    }

    // Unexpected case
    else {
      console.warn('Unexpected timestamp state', timestamp);
      return null;
    }

    const fileKey = `certificates/${id}.pdf`;
    await ctx.s3.put(fileKey, pdf, { contentType: 'application/pdf' });

    await ctx.postgres.exec(
      sql<UserExamTimestamp[]>`
        UPDATE users.exam_timestamps
        SET pdf_key = ${fileKey}
        WHERE id = ${id};
      `,
    );

    return true;
  };

  const generateCertificateThumbnail = async (id: string, pdfKey: string) => {
    const pdf = await ctx.s3.getBlob(pdfKey);
    if (!pdf) {
      console.warn('No pdf found for', pdfKey);
      return null;
    }

    const fileKey = `certificates/${id}.png`;
    const thumbnail = await pdfThumbnail(Buffer.from(pdf));
    if (!thumbnail) {
      console.warn('No thumbnail found for', pdfKey);
      return null;
    }

    await ctx.s3.put(fileKey, thumbnail, { contentType: 'image/png' });

    await ctx.postgres.exec(
      sql<UserExamTimestamp[]>`
        UPDATE users.exam_timestamps
        SET img_key = ${fileKey}
        WHERE id = ${id};
      `,
    );

    return true;
  };

  const getPdfCertificate = async (id: string, stream?: boolean) => {
    const timestamp = await getExamTimestamp(id);
    if (!timestamp || !timestamp.pdfKey) {
      return null;
    }

    const fileKey = `certificates/${id}.pdf`;

    if (stream) {
      return ctx.s3.getStream(fileKey);
    }

    return ctx.s3.getBlob(fileKey);
  };

  const getPngCertificate = async (id: string, stream?: boolean) => {
    const timestamp = await getExamTimestamp(id);
    if (!timestamp || !timestamp.imgKey) {
      return null;
    }

    const fileKey = `certificates/${id}.png`;
    if (stream) {
      return ctx.s3.getStream(fileKey);
    }

    return ctx.s3.getBlob(fileKey);
  };

  const getAllPendingTimestamps = () => {
    return ctx.postgres.exec(
      sql<Array<{ id: string }>>`
          SELECT id
          FROM users.exam_timestamps
          WHERE confirmed = false;
        `,
    );
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
    timestampFinalExamAttempt,
    upgradeExamTimestamp,
    validateExamTimestamp,
    verifyExamTimestamp,
    generatePdfCertificate,
    //
    timestampAllExams: async () => {
      const finalExams = await ctx.postgres.exec(
        sql<Array<{ id: string }>>`
          SELECT a.id
          FROM users.exam_attempts a
          LEFT JOIN users.exam_timestamps t ON a.id = t.exam_attempt_id
          WHERE t.exam_attempt_id IS NULL
            AND a.exam_type = 'final'
            AND a.finalized = true
            AND a.succeeded = true;
        `,
      );

      console.log('[cron] Timestamp all final exams', finalExams);

      for (const { id } of finalExams) {
        try {
          await timestampFinalExamAttempt({ examAttemptId: id });
          await sleep(1000); // Avoid rate limiting
        } catch (err) {
          console.error('Failed to timestamp exam', id, err);
        }
      }

      const singleTrialExams = await ctx.postgres.exec(
        sql<Array<CourseProgressKey>>`
          SELECT
            cp.uid,
            cp.course_id,
            ccl.release_date
          FROM users.course_progress cp
            LEFT JOIN content.courses c ON cp.course_id = c.id
            LEFT JOIN content.course_chapters_localized ccl ON c.id = ccl.course_id AND ccl.language = c.original_language AND ccl.is_course_conclusion = true
          WHERE cp.total_score >= c.passing_grade_threshold
            AND ccl.release_date IS NOT NULL
            AND ccl.release_date - INTERVAL '24 hours' < NOW()
            AND ccl.release_date > NOW()
            AND NOT EXISTS (
              SELECT 1
              FROM users.exam_timestamps t
              WHERE t.uid = cp.uid AND t.course_id = cp.course_id
            )
        `,
      );

      console.log('[cron] Timestamp all single trial exams', singleTrialExams);

      for (const key of singleTrialExams) {
        try {
          await timestampSingleTrialExamAttempt(key);
          await sleep(1000); // Avoid rate limiting
        } catch (err) {
          console.error('Failed to timestamp exam', key, err);
        }
      }
    },
    upgradeAllTimeStamps: async () => {
      const timestamps = await getAllPendingTimestamps();
      if (timestamps.length) {
        console.log('[cron] Upgrade all timestamps', timestamps);

        for (const { id } of timestamps) {
          try {
            await upgradeExamTimestamp(id);
            await sleep(1000); // Avoid rate limiting
          } catch (err) {
            console.error('Failed to upgrade timestamp', id, err);
          }
        }
      }
    },
    validateAllTimeStamps: async () => {
      const timestamps = await getAllPendingTimestamps();
      if (timestamps.length) {
        console.log('[cron] Validate all timestamps', timestamps);

        for (const { id } of timestamps) {
          try {
            await validateExamTimestamp(id);
            await sleep(1000); // Avoid rate limiting
          } catch (err) {
            console.error('Failed to validate timestamp', id, err);
          }
        }
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
      if (timestamps.length) {
        console.log('[cron] Generate all certificates', timestamps);

        for (const { examAttemptId } of timestamps) {
          try {
            await generatePdfCertificate(examAttemptId);
          } catch (err) {
            console.error('Failed to generate certificate', examAttemptId, err);
          }
        }
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
      if (docs.length) {
        console.log('[cron] Generate all certificates thumbnails', docs);

        for (const { examAttemptId, pdfKey } of docs) {
          try {
            await generateCertificateThumbnail(examAttemptId, pdfKey);
          } catch (err) {
            console.error(
              'Failed to generate certificate thumbnail',
              examAttemptId,
              err,
            );
          }
        }
      }
    },
  };
};
