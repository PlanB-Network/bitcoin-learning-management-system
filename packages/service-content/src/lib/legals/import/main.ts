import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { Legal } from '@blms/types';

import type { ChangedLegal } from './index.js';

/**
 * Process the main file of a legal document
 *
 * @param transaction - Database transaction
 * @param legal - The legal document being processed
 * @param file - The changed file
 */
export const createProcessMainFile =
  (transaction: TransactionSql) => async (legal: ChangedLegal) => {
    const lastUpdated = legal.files.sort((a, b) => b.time - a.time)[0];

    const result = await transaction<Legal[]>`
        INSERT INTO content.legals (
          path, name, last_updated, last_commit, last_sync
        )
        VALUES (
          ${legal.path},
          ${legal.name},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (path) DO UPDATE SET
          name = EXCLUDED.name,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING id, path, name, last_updated, last_commit, last_sync
      `.then(firstRow);

    if (!result) {
      throw new Error('Could not insert legal document');
    }

    return result;
  };
