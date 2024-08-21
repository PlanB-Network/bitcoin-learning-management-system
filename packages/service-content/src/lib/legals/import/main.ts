import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type {
  ChangedFile,
  Legal,
  ModifiedFile,
  RenamedFile,
} from '@blms/types';

import type { ChangedLegal } from './index.js';
import { parseDetailsFromPath } from './index.js';

/**
 * Process the main file of a legal document
 *
 * @param transaction - Database transaction
 * @param legal - The legal document being processed
 * @param file - The changed file
 */
export const createProcessMainFile =
  (transaction: TransactionSql) =>
  async (legal: ChangedLegal, file?: ChangedFile) => {
    if (!file) return;

    if (file.kind === 'removed') {
      await transaction`
        DELETE FROM content.legals WHERE path = ${legal.path}
      `;
      return;
    }

    if (file.kind === 'renamed') {
      const { path: previousPath } = parseDetailsFromPath(file.previousPath);

      await transaction`
        UPDATE content.legals
        SET path = ${legal.path}
        WHERE path = ${previousPath}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      const lastUpdated = legal.files
        .filter(
          (file): file is ModifiedFile | RenamedFile => file.kind !== 'removed',
        )
        .sort((a, b) => b.time - a.time)[0];

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
    }
  };
