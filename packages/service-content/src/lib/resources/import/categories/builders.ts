import { firstRow } from '@blms/database';
import type { Builder, Proofreading, Resource } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { BaseResource, ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

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
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  original_language: string;
  language?: string[];
  category: string;
  proofreading: ProofreadingEntry[];
}

interface BuilderLocal extends BaseResource {
  description: string;
}

export const createProcessChangedBuilder = (
  { postgres }: Dependencies,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const { main, files } = separateContentFiles(resource, 'builder.yml');
        if (!main) return;

        try {
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(builders) ${resource?.fullPath}: ${error}`,
          );
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
          const parsedBuilder = yamlToObject<BuilderMain>(main.data);
          // TODO remove when correct data
          if (parsedBuilder.original_language === undefined) {
            parsedBuilder.original_language = '';
          }

          const result = await transaction<Builder[]>`
              INSERT INTO content.builders (resource_id, name, category, languages, website_url, twitter_url, github_url, nostr, address_line_1, address_line_2, address_line_3, original_language)
              VALUES (
                ${id}, ${parsedBuilder.name}, ${parsedBuilder.category.toLowerCase()}, ${parsedBuilder.language},
                ${parsedBuilder.links.website}, ${parsedBuilder.links.twitter},
                ${parsedBuilder.links.github}, ${parsedBuilder.links.nostr}, ${parsedBuilder.address_line_1}, ${parsedBuilder.address_line_2}, ${parsedBuilder.address_line_3}, ${parsedBuilder.original_language}
              )
              ON CONFLICT (resource_id) DO UPDATE SET
                name = EXCLUDED.name,
                category = EXCLUDED.category,
                languages = EXCLUDED.languages,
                website_url = EXCLUDED.website_url,
                twitter_url = EXCLUDED.twitter_url,
                github_url = EXCLUDED.github_url,
                nostr = EXCLUDED.nostr,
                address_line_1 = EXCLUDED.address_line_1,
                address_line_2 = EXCLUDED.address_line_2,
                address_line_3 = EXCLUDED.address_line_3,
                original_language = EXCLUDED.original_language
              RETURNING *
            `.then(firstRow);

          // If the resource has proofreads
          if (parsedBuilder.proofreading) {
            for (const p of parsedBuilder.proofreading) {
              const proofreadResult = await transaction<Proofreading[]>`
                  INSERT INTO content.proofreading (resource_id, language, last_contribution_date, urgency, reward)
                  VALUES (${result?.resourceId}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${p.reward})
                  RETURNING *;
                `.then(firstRow);

              if (p.contributors_id) {
                for (const [index, contrib] of p.contributors_id.entries()) {
                  await transaction`INSERT INTO content.contributors (id) VALUES (${contrib}) ON CONFLICT DO NOTHING`;
                  await transaction`
                      INSERT INTO content.proofreading_contributor(proofreading_id, contributor_id, "order")
                      VALUES (${proofreadResult?.id},${contrib},${index})
                    `;
                }
              }
            }
          }
        } catch (error) {
          errors.push(
            `Error processing file ${main?.path} ((${resource.fullPath})): ${error}`,
          );
          return;
        }

        for (const file of files) {
          try {
            const parsed = yamlToObject<BuilderLocal>(file.data);

            await transaction`
          INSERT INTO content.builders_localized (builder_id, language, description)
          VALUES (${id}, ${file.language}, ${parsed.description.trim()})
          ON CONFLICT (builder_id, language) DO UPDATE SET
            description = EXCLUDED.description
        `.then(firstRow);
          } catch (error) {
            errors.push(
              `Error processing file ${file?.path} (${resource.fullPath}): ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};
