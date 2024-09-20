import { type TransactionSql, firstRow } from '@blms/database';
import type { ChangedFile, UserAccount } from '@blms/types';

import { yamlToObject } from '../../utils.js';

interface BCertificateResult {
  username: string;
  categories: {
    [key: string]: number;
  };
}

export const createProcessResultFile = (transaction: TransactionSql) => {
  return async (id: string, file: ChangedFile) => {
    if (!file || file.kind === 'removed') {
      return;
    }

    const parsed = yamlToObject<BCertificateResult>(file.data);

    const uid = await transaction<Array<Pick<UserAccount, 'uid'>>>`
          SELECT uid FROM users.accounts WHERE username = ${parsed.username}
        `
      .then(firstRow)
      .then((row) => row?.uid);

    if (!uid) {
      throw new Error(`uid not found for username ${parsed.username}`);
    }

    const categories = parsed.categories;

    for (const category of Object.keys(categories)) {
      await transaction`
          INSERT INTO users.b_certificate_results (
            uid, b_certificate_exam, category, score, last_updated, last_commit, last_sync
          )
          VALUES (
            ${uid},
            ${id},
            ${category},
            ${categories[category]},
            ${file.time},
            ${file.commit},
            NOW()
          )
          ON CONFLICT (uid, b_certificate_exam, category) DO UPDATE SET
            score = EXCLUDED.score,
            last_updated = EXCLUDED.last_updated,
            last_commit = EXCLUDED.last_commit,
            last_sync = NOW()
        `;
    }
  };
};
