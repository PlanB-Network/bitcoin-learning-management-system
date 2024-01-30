import { firstRow } from '@sovereign-university/database';
import { Resource } from '@sovereign-university/types';

import { BaseResource, ChangedResource } from '..';
import { Dependencies } from '../../../dependencies';
import { separateContentFiles, yamlToObject } from '../../../utils';
import { createProcessMainFile } from '../main';

/** Base builder information, same for all translations */
interface BuilderMain {
  /** Name of the project or company */
  name: string;
  links: {
    website: string;
    twitter?: string;
    github?: string;
    nostr?: string;
  };
  category: string;
}

interface BuilderLocal extends BaseResource {
  description: string;
}

export const createProcessChangedBuilder = (
  dependencies: Dependencies,
  errors: string[],
) => {
  const { postgres } = dependencies;

  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const { main, files } = separateContentFiles(resource, 'builder.yml');

        try {
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(`Error processing file ${resource?.path}: ${error}`);
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

        try {
          if (main && main.kind !== 'removed') {
            const parsed = yamlToObject<BuilderMain>(main.data);

            await transaction`
          INSERT INTO content.builders (resource_id, name, category, website_url, twitter_url, github_url, nostr)
          VALUES (
            ${id}, ${parsed.name}, ${parsed.category.toLowerCase()}, 
            ${parsed.links.website}, ${parsed.links.twitter},
            ${parsed.links.github}, ${parsed.links.nostr}
          )
          ON CONFLICT (resource_id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            website_url = EXCLUDED.website_url,
            twitter_url = EXCLUDED.twitter_url,
            github_url = EXCLUDED.github_url,
            nostr = EXCLUDED.nostr
        `;
          }
        } catch (error) {
          errors.push(`Error processing file ${main?.path}: ${error}`);
          return;
        }

        for (const file of files) {
          try {
            if (file.kind === 'removed') {
              // If file was deleted, delete the translation from the database

              await transaction`
            DELETE FROM content.builders_localized
            WHERE builder_id = ${id} AND language = ${file.language}
          `;

              continue;
            }

            const parsed = yamlToObject<BuilderLocal>(file.data);

            await transaction`
          INSERT INTO content.builders_localized (builder_id, language, description)
          VALUES (${id}, ${file.language}, ${parsed.description.trim()})
          ON CONFLICT (builder_id, language) DO UPDATE SET
            description = EXCLUDED.description
        `.then(firstRow);
          } catch (error) {
            errors.push(`Error processing file ${file?.path}: ${error}`);
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};
