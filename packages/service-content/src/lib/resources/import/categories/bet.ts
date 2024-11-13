import { firstRow } from '@blms/database';
import type { Bet, Proofreading, Resource } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { BaseResource, ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

interface BetMain {
  type: string;
  builder?: string;
  original_language: string;
  links?: {
    download?: string;
    view?: Array<{ [key: string]: string }>;
  };
  proofreading: ProofreadingEntry[];
}

interface BetLocal extends BaseResource {
  name: string;
  description: string;
}

export const createProcessChangedBet = (
  { postgres }: Dependencies,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main, files } = separateContentFiles(resource, 'bet.yml');
        if (!main) return;

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(bet) ${resource?.fullPath}: ${error}`,
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

        let parsedBet: BetMain | null = null;
        try {
          parsedBet = yamlToObject<BetMain>(main.data);

          const result = await transaction<Bet[]>`
              INSERT INTO content.bet (resource_id, builder, type, download_url, original_language)
              VALUES (${id}, ${parsedBet.builder}, ${parsedBet.type.toLowerCase()}, ${parsedBet.links?.download}, ${parsedBet.original_language})
              ON CONFLICT (resource_id) DO UPDATE SET
                builder = EXCLUDED.builder,
                type = EXCLUDED.type,
                download_url = EXCLUDED.download_url,
                original_language = EXCLUDED.original_language

            `.then(firstRow);

          if (parsedBet.links?.view) {
            for (let i = 0; i < parsedBet.links.view.length; i++) {
              const currentViewUrl = parsedBet.links.view[i];
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

          // If the resource has proofreads
          if (parsedBet.proofreading) {
            for (const p of parsedBet.proofreading) {
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
            `Error processing main file ${main?.path} ((${resource.fullPath})) : ${error}`,
          );
          return;
        }

        for (const file of files) {
          try {
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
            errors.push(
              `Error processing one file (bet) ${file?.path} (${resource.fullPath}): ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};
