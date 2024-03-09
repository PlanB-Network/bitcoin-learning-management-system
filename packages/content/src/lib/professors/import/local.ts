import type { TransactionSql } from '@sovereign-university/database';

import type { ChangedFileWithLanguage } from '../../types.js';
import { yamlToObject } from '../../utils.js';

interface ProfessorLocal {
  bio?: string;
  short_bio?: string;
}

export const createProcessLocalFile =
  (transaction: TransactionSql) =>
  async (id: number, file: ChangedFileWithLanguage) => {
    if (file.kind === 'removed') {
      // If file was deleted, delete the translation from the database

      await transaction`
        DELETE FROM content.professors_localized
        WHERE id = ${id} AND language = ${file.language}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      const parsed = yamlToObject<ProfessorLocal>(file.data);

      await transaction`
        INSERT INTO content.professors_localized (
          professor_id, language, bio, short_bio
        )
        VALUES (
          ${id},
          ${file.language},
          ${parsed.bio},
          ${parsed.short_bio}
        )
        ON CONFLICT (professor_id, language) DO UPDATE SET
          bio = EXCLUDED.bio,
          short_bio = EXCLUDED.short_bio
      `;
    }
  };
