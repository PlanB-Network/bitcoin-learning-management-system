import type { ChangedFile } from '@sovereign-academy/types';

import type { Language } from '../const';
import { Dependencies } from '../dependencies';
import { ChangedContent } from '../types';
import { getContentType } from '../utils';

import { createProcessChangedBook } from './categories/books';
import { createProcessChangedBuilder } from './categories/builders';
import { createProcessChangedPodcast } from './categories/podcasts';
import { assertSupportedCategoryPath } from './const';
import type { ResourceCategory } from './const';

interface ResourceDetails {
  category: ResourceCategory;
  path: string;
  language?: Language;
}

export interface BaseResource {
  contributors?: string[];
}

export interface ChangedResource extends ChangedContent {
  category: ResourceCategory;
}

/**
 * Get the relative path of the file compared to the resource directory if it's a regular file
 * or the resource assets directory if it's an asset.
 *
 * Examples:
 *  - `resources/books/bitcoin/en.yml` -> `en.yml`
 *  - `resources/books/bitcoin/assets/logo.png` -> `logo.png`
 *
 * @param path - Path of the file
 * @returns Relative path of the file
 */
const getRelativePath = (path: string) => {
  const pathElements = path.split('/');

  return (
    pathElements[3] === 'assets' ? pathElements.slice(4) : pathElements.slice(3)
  ).join('/');
};

/**
 * Parse resource details from path
 *
 * @param path - Path of the file
 * @returns Resource details
 */
const parseDetailsFromPath = (path: string): ResourceDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (resources/category/name)
  if (pathElements.length < 3) throw new Error('Invalid resource path');

  // Validate that the file is located under a supported resource category directory
  const categorySubpath = pathElements[1];
  assertSupportedCategoryPath(categorySubpath);

  return {
    category: categorySubpath,
    path: pathElements.slice(0, 3).join('/'),
    language: pathElements[3].replace(/\..*/, '') as Language,
  };
};

export const groupByResource = (files: ChangedFile[], baseUrl: string) => {
  const resourceFiles = files.filter(
    (item) => getContentType(item.path) === 'resources'
  );

  const groupedResources = new Map<string, ChangedResource>();

  for (const file of resourceFiles) {
    const {
      category,
      path: resourcePath,
      language,
    } = parseDetailsFromPath(file.path);

    const resource =
      groupedResources.get(resourcePath) ||
      ({
        type: 'resources',
        category,
        path: resourcePath,
        sourceUrl: `${baseUrl}/blob/${file.commit}/${resourcePath}`,
        files: [],
        assets: [],
      } as ChangedResource);

    if (file.isAsset) {
      resource.assets.push({
        ...file,
        path: getRelativePath(file.path),
      });
    } else {
      resource.files.push({
        ...file,
        path: getRelativePath(file.path),
        language,
      });
    }

    groupedResources.set(resourcePath, resource);
  }

  return Array.from(groupedResources.values());
};

export const createProcessChangedResource =
  (dependencies: Dependencies) => async (resource: ChangedResource) => {
    const mapHandlers = {
      books: createProcessChangedBook,
      builders: createProcessChangedBuilder,
      podcasts: createProcessChangedPodcast,
    } as const;

    const handler = mapHandlers[resource.category];
    return handler(dependencies)(resource);
  };
