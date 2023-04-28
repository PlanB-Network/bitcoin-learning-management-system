import { firstRow } from '@sovereign-academy/database';
import type { ChangedAsset, ChangedFile, Resource } from '@sovereign-academy/types';

import { Dependencies } from '../dependencies';

import {
  Article,
  Book,
  ChangedResource,
  Language,
  Podcast,
  isAsset,
} from './types';
import type { FullResource, ResourceType } from './types';
import {
  ValidationError,
  getContentType,
  supportedLanguages,
  supportedTypes,
  yamlToObject,
} from './utils';

const parseResource = (data: string) => {
  const resource = yamlToObject<FullResource>(data);

  // Validate values
  if (!resource.original || !supportedLanguages.includes(resource.original)) {
    throw new ValidationError('Resource should have a valid language code');
  }

  if (!resource.type || !supportedTypes.includes(resource.type)) {
    throw new ValidationError('Resource should have a valid type');
  }

  return resource;
};

const parseResourcePath = (path: string) => {
  const pathElements = path.split('/');
  if (pathElements.length < 3) throw new Error('Invalid resource path');

  const type = pathElements[1];
  const singularType = type[type.length - 1] === 's' ? type.slice(0, -1) : type;

  const relativePath = pathElements.slice(0, 3).join('/');

  return {
    type: singularType as ResourceType,
    path: relativePath.startsWith('assets/')
      ? relativePath.slice(7)
      : relativePath,
    language: pathElements[3].replace(/\..*/, '') as Language,
  };
};

export const groupByResource = (
  files: (ChangedFile | ChangedAsset)[],
  baseUrl: string
) => {
  const resourceFiles = files.filter(
    (item) => getContentType(item.path) === 'resources'
  );

  const groupedResources = new Map<string, ChangedResource>();

  for (const file of resourceFiles) {
    const { type, path: resourcePath, language } = parseResourcePath(file.path);

    const resource = groupedResources.get(resourcePath) || {
      type,
      path: resourcePath,
      sourceUrl: `${baseUrl}/blob/${file.commit}/${resourcePath}`,
      files: [],
      assets: [],
    };

    file.path = file.path.replace(resourcePath + '/', '')

    if (isAsset(file)) {
      resource.assets.push(file);
    } else {
      resource.files.push({
        ...file,
        language
      });
    }

    groupedResources.set(resourcePath, resource);
  }

  return Array.from(groupedResources.values());
};

export const createProcessChangedResource =
  (dependencies: Dependencies) => async (resource: ChangedResource) => {
    const { postgres } = dependencies;

    const lastUpdated = [...resource.files, ...resource.assets].sort(
      (a, b) => b.time - a.time
    )[0];

    const resourceFile = resource.files.find(
      ({ path }) => path === 'resource.yml'
    );

    return postgres.begin(async (transaction) => {
      if(resourceFile) {
        switch (resourceFile.kind) {
          case 'added':
          case 'modified': {
            // If new or updated resource file, insert or update resource
            const parsedResource = parseResource(resourceFile.data);

            await transaction`
              INSERT INTO content.resources (type, path, original_language, last_updated, last_commit)
              VALUES (
                ${resource.type}, 
                ${resource.path}, 
                ${parsedResource.original}, 
                ${lastUpdated.time}, 
                ${lastUpdated.commit}
              )
              ON CONFLICT (type, path) DO UPDATE SET
                original_language = ${parsedResource.original},
                last_updated = ${lastUpdated.time},
                last_commit = ${lastUpdated.commit}
            `

            break;
          }
          case 'removed': {
            // If resource file was removed, delete the main resource and all its translations (with cascade)
            await transaction`
              DELETE FROM content.resources WHERE path = ${resource.path} 
            `;

            return;
          }
          case 'renamed': {
            // If resource file was moved, update the path
            // We assume the whole resource folder was moved
            await transaction`
              UPDATE content.resources
              SET path = ${resource.path}
              WHERE path = ${resourceFile.previousPath}
            `;
          
            break;
          }
        }
      }

      const resourceId = await transaction<Resource[]>`
          SELECT id FROM content.resources WHERE path = ${resource.path}
        `
        .then(firstRow)
        .then((row) => row?.id);

      if (!resourceId) {
        throw new Error('Resource not found');
      }

      for (const file of resource.files) {
        if (file.path === 'resource.yml') {
          continue;
        }

        if (file.kind === 'removed') {
          // If file was deleted, delete the translation from the database
          await transaction`
            DELETE FROM ${postgres(`content.${resource.type}s`)} 
            WHERE
              resource_id = ${resourceId} 
              AND language = ${file.language}
          `;
          continue;
        }

        switch (resource.type) {
          case 'book': {
            const parsed = yamlToObject<Book>(file.data);

            await transaction`
              INSERT INTO content.books (resource_id, language, title, author, description, publication_date, cover)
              VALUES (
                ${resourceId},
                ${file.language},
                ${parsed.title},
                ${parsed.author},
                ${parsed.description},
                ${parsed.publication_date},
                ${parsed.cover}
              )
              ON CONFLICT (resource_id, language) DO UPDATE SET
                title = ${parsed.title},
                author = ${parsed.author},
                description = ${parsed.description},
                publication_date = ${parsed.publication_date},
                cover = ${parsed.cover}
            `;

            break;
          }
          case 'podcast': {
            const parsed = yamlToObject<Podcast>(file.data);

            await transaction`
              INSERT INTO content.podcasts (resource_id, language, name, description, platform_url)
              VALUES (
                ${resourceId},
                ${file.language},
                ${parsed.name},
                ${parsed.description}
                ${parsed.platform_url}
              )
              ON CONFLICT (resource_id, language) DO UPDATE SET
                title = ${parsed.name},
                description = ${parsed.description}
                platform_url = ${parsed.platform_url}
            `;
            break;
          }
          case 'article': {
            const parsed = yamlToObject<Article>(file.data);

            await transaction`
              INSERT INTO content.articles (resource_id, language, title, author, description, publication_date)
              VALUES (
                ${resourceId},
                ${file.language},
                ${parsed.title},
                ${parsed.author},
                ${parsed.description},
                ${parsed.publication_date}
              )
              ON CONFLICT (resource_id, language) DO UPDATE SET
                title = ${parsed.title},
                author = ${parsed.author},
                description = ${parsed.description},
                publication_date = ${parsed.publication_date}
            `;
            break;
          }
        }
      }
    });
  };
