import { TransactionSql, firstRow } from '@sovereign-academy/database';
import { ChangedTextFile, Resource } from '@sovereign-academy/types';

import { yamlToObject } from '../utils';

import { ChangedResource } from '.';

export const createProcessMainFile =
  (transaction: TransactionSql) =>
  async (resource: ChangedResource, file?: ChangedTextFile) => {
    if (!file) return;

    if (file.kind === 'removed') {
      // If resource file was removed, delete the main resource and all its translations (with cascade)

      await transaction`
        DELETE FROM content.resources WHERE path = ${resource.path} 
      `;

      return;
    }

    if (file.kind === 'renamed') {
      // If resource file was moved, update the path
      // We assume the whole resource folder was moved

      const previousPath = file.previousPath.split('/').slice(0, -1).join('/');

      await transaction`
        UPDATE content.resources
        SET path = ${resource.path}
        WHERE path = ${previousPath}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      // If new or updated resource file, insert or update resource

      // Only get the tags from the main resource file
      const parsedResource = yamlToObject<{
        tags?: string[];
      }>(file.data);

      const lastUpdated = [...resource.files, ...resource.assets].sort(
        (a, b) => b.time - a.time
      )[0];

      const result = await transaction<Resource[]>`
        INSERT INTO content.resources (category, path, last_updated, last_commit)
        VALUES (
          ${resource.category}, 
          ${resource.path},
          ${lastUpdated.time}, 
          ${lastUpdated.commit}
        )
        ON CONFLICT (category, path) DO UPDATE SET
          last_updated = ${lastUpdated.time},
          last_commit = ${lastUpdated.commit}
        RETURNING *
      `.then(firstRow);

      // If the resource has tags, insert them into the tags table and link them to the resource
      if (result && parsedResource.tags && parsedResource.tags?.length > 0) {
        await transaction`
          INSERT INTO content.tags ${transaction(
            parsedResource.tags.map((tag) => ({ name: tag }))
          )}
          ON CONFLICT DO NOTHING
        `;

        await transaction`
          INSERT INTO content.resource_tags (resource_id, tag_id)
          SELECT
            ${result.id}, 
            id FROM content.tags WHERE name = ANY(${parsedResource.tags})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  };
