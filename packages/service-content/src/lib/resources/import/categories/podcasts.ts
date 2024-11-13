import { firstRow } from '@blms/database';
import type { Resource } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

/** Base podcast information, same for all translations */
interface PodcastMain {
  /** Name of the podcast */
  name: string;
  /** Name of the host */
  host: string;
  language: string;
  description?: string;
  links?: {
    website?: string;
    twitter?: string;
    podcast?: string;
    nostr?: string;
  };
}

export const createProcessChangedPodcast = (
  { postgres }: Dependencies,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main } = separateContentFiles(resource, 'podcast.yml');
        if (!main) return;

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(podcasts) ${resource?.path} (${resource.fullPath}): ${error}`,
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
          const parsed = yamlToObject<PodcastMain>(main.data);

          await transaction`
              INSERT INTO content.podcasts (
                resource_id, language, name, host, description, website_url, twitter_url, podcast_url, nostr
              )
              VALUES (
                ${id}, ${parsed.language}, ${parsed.name}, ${parsed.host},
                ${parsed.description?.trim()}, ${parsed.links?.website},
                ${parsed.links?.twitter}, ${parsed.links?.podcast},
                ${parsed.links?.nostr}
              )
              ON CONFLICT (resource_id) DO UPDATE SET
                language = EXCLUDED.language,
                name = EXCLUDED.name,
                host = EXCLUDED.host,
                description = EXCLUDED.description,
                website_url = EXCLUDED.website_url,
                twitter_url = EXCLUDED.twitter_url,
                podcast_url = EXCLUDED.podcast_url,
                nostr = EXCLUDED.nostr
            `;
        } catch (error) {
          errors.push(
            `Error processing file(podcasts) ${main?.path} (${resource.fullPath}): ${error}`,
          );
        }
      })
      .catch(() => {
        return;
      });
  };
};
