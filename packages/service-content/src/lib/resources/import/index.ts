import { sql } from '@blms/database';
import type { ChangedFile } from '@blms/types';

import type { Language } from '../../const.js';
import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import { getContentType, getRelativePath } from '../../utils.js';

import { createProcessChangedBet } from './categories/bet.js';
import { createProcessChangedBook } from './categories/books.js';
import { createProcessChangedConference } from './categories/conferences.js';
import { createProcessChangedGlossaryWord } from './categories/glossary.js';
import { createProcessChangedMovie } from './categories/movies.js';
import { createProcessChangedNewsletter } from './categories/newsletters.js';
import { createProcessChangedPodcast } from './categories/podcasts.js';
import { createProcessChangedProject } from './categories/projects.js';
import { createProcessChangedYoutubeChannel } from './categories/youtubeChannels.js';
import type { ResourceCategory } from './const.js';
import { assertSupportedCategoryPath } from './const.js';

interface ResourceDetails {
  category: ResourceCategory;
  path: string;
  fullPath: string;
  language?: Language;
}

export interface BaseResource {
  contributor_names?: string[];
}

export interface ChangedResource extends ChangedContent {
  category: ResourceCategory;
}

/**
 * Parse resource details from path
 *
 * @param path - Path of the file
 * @returns Resource details
 */
const parseDetailsFromPath = (path: string): ResourceDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (resources/category/name)
  if (pathElements.length < 3) {
    throw new Error('Invalid resource path');
  }

  // Validate that the file is located under a supported resource category directory
  const categorySubpath = pathElements[1];
  assertSupportedCategoryPath(categorySubpath);

  return {
    category: categorySubpath,
    fullPath: pathElements.join('/'),
    language: pathElements[3].replace(/\..*/, '').toLowerCase() as Language,
    path: pathElements.slice(0, 3).join('/'),
  };
};

export const groupByResource = (files: ChangedFile[], errors: string[]) => {
  // Filter the resource files
  const resourceFiles = files.filter(
    (item) => getContentType(item.path) === 'resources',
  );

  const groupedResources = new Map<string, ChangedResource>();

  for (const file of resourceFiles) {
    try {
      const {
        category,
        path: resourcePath,
        fullPath,
        language,
      } = parseDetailsFromPath(file.path);

      const resource: ChangedResource = groupedResources.get(resourcePath) || {
        category,
        files: [],
        fullPath,
        path: resourcePath,
        type: 'resources',
      };

      resource.files.push({
        ...file,
        language,
        path: getRelativePath(file.path, resourcePath),
      });

      groupedResources.set(resourcePath, resource);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  const groupedResourceValues = [...groupedResources.values()];

  // Return projects first
  return [
    ...groupedResourceValues.filter((resource) =>
      resource.path.startsWith('resources/projects'),
    ),
    ...groupedResourceValues.filter(
      (resource) => !resource.path.startsWith('resources/projects'),
    ),
  ];
};

export const createUpdateResources = (
  dependencies: Pick<Dependencies, 'postgres'>,
) => {
  return async (resource: ChangedResource, errors: string[]) => {
    const mapHandlers = {
      bet: createProcessChangedBet,
      books: createProcessChangedBook,
      channels: createProcessChangedYoutubeChannel,
      conferences: createProcessChangedConference,
      glossary: createProcessChangedGlossaryWord,
      movies: createProcessChangedMovie,
      newsletters: createProcessChangedNewsletter,
      podcasts: createProcessChangedPodcast,
      projects: createProcessChangedProject,
    } as const;

    const handler = mapHandlers[resource.category];
    return handler(dependencies, errors)(resource);
  };
};

export const createDeleteResources = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`DELETE FROM content.resources WHERE last_sync < ${sync_date}
      `,
      );
    } catch {
      errors.push('Error deleting resources');
    }
  };
};
