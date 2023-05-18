import { TransactionSql, firstRow } from '@sovereign-academy/database';
import { ChangedTextFile, Tutorial } from '@sovereign-academy/types';

import { yamlToObject } from '../utils';

import { ChangedTutorial, parseDetailsFromPath } from '.';

interface TutorialMain {
  level: string;
  builder?: string;
  tags?: string[];
}

export const createProcessMainFile =
  (transaction: TransactionSql) =>
  async (tutorial: ChangedTutorial, file?: ChangedTextFile) => {
    if (!file) return;

    if (file.kind === 'removed') {
      // If tutorial file was removed, delete the main tutorial and all its translations (with cascade)

      await transaction`
        DELETE FROM content.tutorials WHERE path = ${tutorial.path} 
      `;

      return;
    }

    if (file.kind === 'renamed') {
      // If tutorial file was moved, update the id

      const { path: previousPath } = parseDetailsFromPath(file.previousPath);

      await transaction`
        UPDATE content.resources
        SET path = ${tutorial.path}
        WHERE path = ${previousPath}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      // If new or updated tutorial file, insert or update tutorial

      // Only get the tags from the main tutorial file
      const parsedTutorial = yamlToObject<TutorialMain>(file.data);

      const lastUpdated = [...tutorial.files, ...tutorial.assets].sort(
        (a, b) => b.time - a.time
      )[0];

      const result = await transaction<Tutorial[]>`
        INSERT INTO content.tutorials (category, path, last_updated, last_commit)
        VALUES (
          ${tutorial.category}, 
          ${tutorial.path},
          ${lastUpdated.time}, 
          ${lastUpdated.commit}
        )
        ON CONFLICT (category, path) DO UPDATE SET
          level = EXCLUDED.level,
          builder = EXCLUDED.builder,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit
        RETURNING *
      `.then(firstRow);

      // If the resource has tags, insert them into the tags table and link them to the resource
      if (result && parsedTutorial.tags && parsedTutorial.tags?.length > 0) {
        await transaction`
          INSERT INTO content.tags ${transaction(
            parsedTutorial.tags.map((tag) => ({ name: tag }))
          )}
          ON CONFLICT DO NOTHING
        `;

        await transaction`
          INSERT INTO content.tutorial_tags (tutorial_id, tag_id)
          SELECT
            ${result.id}, 
            id FROM content.tags WHERE name = ANY(${parsedTutorial.tags})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  };
