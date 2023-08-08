import { TransactionSql, firstRow } from '@sovereign-university/database';
import {
  ChangedFile,
  ModifiedFile,
  RenamedFile,
  Tutorial,
} from '@sovereign-university/types';

import { yamlToObject } from '../../utils';

import { ChangedTutorial, parseDetailsFromPath } from '.';

interface TutorialMain {
  level: string;
  category?: string;
  builder?: string;
  tags?: string[];
}

export const createProcessMainFile =
  (transaction: TransactionSql) =>
  async (tutorial: ChangedTutorial, file?: ChangedFile) => {
    if (!file) return;

    if (file.kind === 'removed') {
      // If tutorial file was removed, delete the main tutorial and all its translations (with cascade)

      await transaction`
        DELETE FROM content.tutorials WHERE path = ${tutorial.path} 
      `;

      return;
    }

    if (file.kind === 'renamed') {
      // If tutorial file was moved, update the path

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

      const lastUpdated = tutorial.files
        .filter(
          (file): file is ModifiedFile | RenamedFile => file.kind !== 'removed'
        )
        .sort((a, b) => b.time - a.time)[0];

      const result = await transaction<Tutorial[]>`
        INSERT INTO content.tutorials (path, category, subcategory, level, builder, last_updated, last_commit)
        VALUES (
          ${tutorial.path},
          ${tutorial.category},
          ${parsedTutorial.category}, 
          ${parsedTutorial.level},
          ${parsedTutorial.builder},
          ${lastUpdated.time}, 
          ${lastUpdated.commit}
        )
        ON CONFLICT (path) DO UPDATE SET
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
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
