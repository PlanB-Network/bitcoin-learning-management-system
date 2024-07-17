import type { TransactionSql } from '@sovereign-university/database';
import { firstRow } from '@sovereign-university/database';
import type {
  BCertificateExam,
  ChangedFile,
  ModifiedFile,
  RenamedFile,
} from '@sovereign-university/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedBCertificateExam } from './index.js';

interface BCertificateExamMain {
  exam_id: string;
  date: string;
  location: string;
  duration: number;
  score_min: number;
}

export const createProcessMainFile =
  (transaction: TransactionSql) =>
  async (bCertificateExam: ChangedBCertificateExam, file?: ChangedFile) => {
    if (!file) return;

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      // If new or updated file, insert or update

      const parsedBCertificateExam = yamlToObject<BCertificateExamMain>(
        file.data,
      );

      const lastUpdated = bCertificateExam.files
        .filter(
          (file): file is ModifiedFile | RenamedFile => file.kind !== 'removed',
        )
        .sort((a, b) => b.time - a.time)[0];

      await transaction<BCertificateExam[]>`
        INSERT INTO content.b_certificate_exam (
          id, date, location, min_score, duration, last_updated, last_commit, last_sync
        )
        VALUES (
          ${parsedBCertificateExam.exam_id},
          ${parsedBCertificateExam.date},
          ${parsedBCertificateExam.location},
          ${parsedBCertificateExam.score_min},
          ${parsedBCertificateExam.duration},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          date = EXCLUDED.date,
          location = EXCLUDED.location,
          min_score = EXCLUDED.min_score,
          duration = EXCLUDED.duration,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `.then(firstRow);
    }
  };
