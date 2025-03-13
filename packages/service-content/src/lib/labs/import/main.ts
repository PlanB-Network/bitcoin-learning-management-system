import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { ChangedFile, Lab } from '@blms/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedLab } from './index.js';

interface LabMain {
  professor_id: string;
  student_count?: number;
  telegram_url?: string;
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (lab: ChangedLab, file?: ChangedFile) => {
    if (!file) return;

    const parsedLab = await yamlToObject<LabMain>(file);

    const lastUpdated = lab.files.sort((a, b) => b.time - a.time)[0];

    const result = await transaction<Lab[]>`
        INSERT INTO content.labs (
          path,
          study_group,
          professor_id,
          student_count,
          telegram_url,
          last_updated,
          last_commit,
          last_sync
        )
        VALUES (
          ${lab.path},
          ${lab.path.split('/')[1]},
          ${parsedLab.professor_id},
          ${parsedLab.student_count ?? 0},
          ${parsedLab.telegram_url},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (path) DO UPDATE SET
          study_group = EXCLUDED.study_group,
          professor_id = EXCLUDED.professor_id,
          student_count = EXCLUDED.student_count,
          telegram_url = EXCLUDED.telegram_url,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `.then(firstRow);

    return result;
  };
};
