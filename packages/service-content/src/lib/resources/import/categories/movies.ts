import { firstRow } from '@blms/database';
import type { Resource } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

interface MovieMain {
  id: string;
  title: string;
  language: string;
  author: string;
  duration?: number;
  description?: string;
  publication_year?: number;
  links: {
    platform: string;
    trailer: string;
  };
}

export const createProcessChangedMovie = (
  { postgres }: Pick<Dependencies, 'postgres'>,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main } = separateContentFiles(resource, 'movie.yml');
        if (!main) return;

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(movies) ${resource?.path} (${resource.fullPath}): ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
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
          const parsed = await yamlToObject<MovieMain>(main);

          await transaction`
              INSERT INTO content.movies (
                resource_id, id, language, title, description, author, duration, publication_year, platform, trailer
              )
              VALUES (
                ${resourceId}, ${parsed.id}, ${parsed.language}, ${parsed.title}, ${parsed.description?.trim()}, ${parsed.author}, ${parsed.duration}, ${parsed.publication_year}, ${parsed.links?.platform}, ${parsed.links?.trailer}
              )
              ON CONFLICT (resource_id) DO UPDATE SET
                language = EXCLUDED.language,
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                author = EXCLUDED.author,
                duration = EXCLUDED.duration,
                publication_year = EXCLUDED.publication_year,
                platform = EXCLUDED.platform,
                trailer = EXCLUDED.trailer;
            `;
        } catch (error) {
          errors.push(
            `Error processing file(movies) ${main?.path} (${resource.fullPath}): ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );
        }
      })
      .catch((error) => {
        errors.push(`Error during transaction: ${error}`);
      });
  };
};
