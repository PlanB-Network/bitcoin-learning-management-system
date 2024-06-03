import { firstRow } from '@sovereign-university/database';
import type { Resource } from '@sovereign-university/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { BaseResource, ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

interface BetMain {
  type: string;
  builder?: string;
  links?: {
    download?: string;
    view?: Array<{ [key: string]: string }>;
  };
}

interface BetLocal extends BaseResource {
  name: string;
  description: string;
}

export const createProcessChangedBet = (
  dependencies: Dependencies,
  errors: string[],
) => {
  const { postgres } = dependencies;

  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main, files } = separateContentFiles(resource, 'bet.yml');

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(`Error processing file(bet) ${resource?.path}: ${error}`);
          return;
        }

        const id = await transaction<Resource[]>`
          SELECT id FROM content.resources WHERE path = ${resource.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(`Resource not found for path ${resource.path}`);
        }

        let parsed: BetMain | null = null;
        try {
          if (main && main.kind !== 'removed') {
            parsed = yamlToObject<BetMain>(main.data);

            await transaction`
              INSERT INTO content.bet (resource_id, builder, type, download_url)
              VALUES (${id}, ${parsed.builder}, ${parsed.type.toLowerCase()}, ${parsed.links?.download})
              ON CONFLICT (resource_id) DO UPDATE SET
                builder = EXCLUDED.builder,
                type = EXCLUDED.type,
                download_url = EXCLUDED.download_url
            `;

            if (parsed.links?.view) {
              for (let i = 0; i < parsed.links.view.length; i++) {
                const currentViewUrl = parsed.links.view[i];
                for (const key of Object.keys(currentViewUrl)) {
                  await transaction`
                  INSERT INTO content.bet_view_url (bet_id, language, view_url)
                  VALUES (${id}, ${key}, ${currentViewUrl[key]})
                  ON CONFLICT (bet_id, language) DO UPDATE SET
                    language = EXCLUDED.language,
                    view_url = EXCLUDED.view_url
                  `;
                }
              }
            }
          }
        } catch (error) {
          errors.push(`Error processing main file ${main?.path} : ${error}`);
          return;
        }

        for (const file of files) {
          try {
            // TODO IMPOSSIBLE
            if (file.kind === 'removed') {
              // If file was deleted, delete the translation from the database

              await transaction`
                DELETE FROM content.bet_localized
                WHERE bet_id = ${id} AND language = ${file.language}
              `;

              continue;
            }

            const parsed = yamlToObject<BetLocal>(file.data);

            await transaction`
              INSERT INTO content.bet_localized (
                bet_id, language, name, description
              )
              VALUES (${id}, ${file.language}, ${parsed.name.trim()}, ${parsed.description.trim()})
              ON CONFLICT (bet_id, language) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description
            `.then(firstRow);
          } catch (error) {
            errors.push(`Error processing one file ${file?.path}: ${error}`);
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};
