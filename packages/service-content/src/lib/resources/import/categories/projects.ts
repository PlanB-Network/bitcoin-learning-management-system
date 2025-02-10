import { firstRow } from '@blms/database';
import type { Project, Proofreading, Resource } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { BaseResource, ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

/** Base project information, same for all translations */
interface ProjectMain {
  /** Name of the project or company */
  id: string;
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

interface ProjectLocal extends BaseResource {
  description: string;
}

export const createProcessChangedProject = (
  { postgres }: Dependencies,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const { main, files } = separateContentFiles(resource, 'project.yml');
        if (!main) return;

        try {
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(projects) ${resource?.fullPath}: ${error}`,
          );
          return;
        }

        const resourceId = await transaction<Resource[]>`
          SELECT id FROM content.resources WHERE path = ${resource.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!resourceId) {
          throw new Error(`Resource not found for path ${resource.path}`);
        }

        try {
          const parsedProject = await yamlToObject<ProjectMain>(main);

          const result = await transaction<Project[]>`
              INSERT INTO content.projects (id, resource_id, name, category, languages, website_url, twitter_url, github_url, nostr, address_line_1, address_line_2, address_line_3, original_language)
              VALUES (
                ${parsedProject.id},${resourceId}, ${parsedProject.name}, ${parsedProject.category.toLowerCase()}, ${parsedProject.language},
                ${parsedProject.links.website}, ${parsedProject.links.twitter},
                ${parsedProject.links.github}, ${parsedProject.links.nostr}, ${parsedProject.address_line_1}, ${parsedProject.address_line_2}, ${parsedProject.address_line_3}, ${parsedProject.original_language}
              )
              ON CONFLICT (id) DO UPDATE SET
                resource_id = EXCLUDED.resource_id,
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
          if (parsedProject.proofreading) {
            for (const p of parsedProject.proofreading) {
              const proofreadResult = await transaction<Proofreading[]>`
                  INSERT INTO content.proofreading (resource_id, language, last_contribution_date, urgency, reward)
                  VALUES (${result?.resourceId}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${Math.round(p.reward * 100)})
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

          for (const file of files) {
            try {
              const parsed = await yamlToObject<ProjectLocal>(file);

              await transaction`
              INSERT INTO content.projects_localized (id, language, description)
              VALUES (
                ${parsedProject.id},  ${file.language}, ${parsed.description.trim()})
              ON CONFLICT (id, language) DO UPDATE SET
                description = EXCLUDED.description
            `.then(firstRow);
            } catch (error) {
              errors.push(
                `Error processing file ${file?.path} (${resource.fullPath}): ${error}`,
              );
            }
          }
        } catch (error) {
          errors.push(
            `Error processing file ${main?.path} ((${resource.fullPath})): ${error}`,
          );
          return;
        }
      })
      .catch(() => {
        return;
      });
  };
};
