import type { TransactionSql } from '@blms/database';
import type { BCertificateExam, ChangedFile } from '@blms/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedBCertificateExam } from './index.js';

interface BCertificateExamMain {
  exam_id: string;
  date: string;
  location: string;
  duration: number;
  score_min: number;
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (
    bCertificateExam: ChangedBCertificateExam,
    file?: ChangedFile,
  ) => {
    if (!file) return;

    const parsedBCertificateExam = yamlToObject<BCertificateExamMain>(
      file.data,
    );

    const lastUpdated = bCertificateExam.files.sort(
      (a, b) => b.time - a.time,
    )[0];

    await transaction<BCertificateExam[]>`
        INSERT INTO content.b_certificate_exam (
          id, path, date, location, min_score, duration, last_updated, last_commit, last_sync
        )
        VALUES (
          ${parsedBCertificateExam.exam_id},
          ${bCertificateExam.path},
          ${parsedBCertificateExam.date},
          ${parsedBCertificateExam.location},
          ${parsedBCertificateExam.score_min},
          ${parsedBCertificateExam.duration},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          path = EXCLUDED.path,
          date = EXCLUDED.date,
          location = EXCLUDED.location,
          min_score = EXCLUDED.min_score,
          duration = EXCLUDED.duration,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `;
  };
};
