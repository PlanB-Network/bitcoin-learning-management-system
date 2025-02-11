import type { TransactionSql } from '@blms/database';
import type { BCertificateExam, ChangedFile } from '@blms/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedBCertExam } from './index.js';

interface BCertExamMain {
  exam_id: string;
  date: string;
  location: string;
  duration: number;
  score_min: number;
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (bCertificateExam: ChangedBCertExam, file?: ChangedFile) => {
    if (!file) return;

    const parsedBCertExam = await yamlToObject<BCertExamMain>(file);

    const lastUpdated = bCertificateExam.files.sort(
      (a, b) => b.time - a.time,
    )[0];

    await transaction<BCertificateExam[]>`
        INSERT INTO content.b_certificate_exam (
          id, path, date, location, min_score, duration, last_updated, last_commit, last_sync
        )
        VALUES (
          ${parsedBCertExam.exam_id},
          ${bCertificateExam.path},
          ${parsedBCertExam.date},
          ${parsedBCertExam.location},
          ${parsedBCertExam.score_min},
          ${parsedBCertExam.duration},
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
