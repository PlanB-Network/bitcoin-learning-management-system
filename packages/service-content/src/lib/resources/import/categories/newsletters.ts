import { validate as uuidValidate } from 'uuid';

import { firstRow } from '@blms/database';
import type { Resource } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { BaseResource, ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

interface NewsletterMain {
  id: string;
  level: string;
  author: string;
  title: string;
  link?: Array<{ website?: string }>;
  publication_date: string;
  tags?: string[];
  contributors?: string[];
  language: string;
}

interface NewsletterLocal extends BaseResource {
  description: string;
}

export const createProcessChangedNewsletter = (
  { postgres }: Dependencies,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main, files } = separateContentFiles(
          resource,
          'newsletter.yml',
        );
        if (!main) return;

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(newsletters) ${resource?.path} (${resource.fullPath}): ${error}`,
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
          const parsed = yamlToObject<NewsletterMain>(main.data);

          if (!uuidValidate(parsed.id)) {
            throw new Error(`Invalid UUID format for parsed.id: ${parsed.id}`);
          }
          const websiteUrl = parsed.link?.[0]?.website;
          await transaction`
            INSERT INTO content.newsletters (
              resource_id, id, author, level, website_url, publication_date, title, tags, contributors, language
            )
            VALUES (
              ${id},
              ${parsed.id}::uuid,
              ${parsed.author},
              ${parsed.level},
              ${websiteUrl},
              ${parsed.publication_date},
              ${parsed.title},
              ${parsed.tags || []},
              ${parsed.contributors || []},
              ${parsed.language}
            )
            ON CONFLICT (resource_id) DO UPDATE SET
              id = EXCLUDED.id,
              author = EXCLUDED.author,
              level = EXCLUDED.level,
              website_url = EXCLUDED.website_url,
              publication_date = EXCLUDED.publication_date,
              title = EXCLUDED.title,
              tags = EXCLUDED.tags,
              contributors = EXCLUDED.contributors,
              language = EXCLUDED.language;
          `;
        } catch (error) {
          console.error('Error processing main file:', error);
          errors.push(
            `Error processing main file ${main?.path} (${resource.fullPath}): ${error}`,
          );
        }

        for (const file of files) {
          try {
            const parsedLocal = yamlToObject<NewsletterLocal>(file.data);

            await transaction`
              INSERT INTO content.newsletters_localized (
                newsletter_id, description
              )
              VALUES (
                ${id},
                ${parsedLocal.description?.trim() || null}
              )
              ON CONFLICT (newsletter_id) DO UPDATE SET
                description = EXCLUDED.description
            `.then(firstRow);
          } catch (error) {
            errors.push(
              `Error processing one file ${id} ${file?.path} (${resource.fullPath}): ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};
