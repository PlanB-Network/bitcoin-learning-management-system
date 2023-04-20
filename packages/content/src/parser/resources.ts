import type { ChangedFile } from '@sovereign-academy/types';

import type { ChangedContent, Resource, ResourceType } from './types';
import {
  ValidationError,
  supportedLanguages,
  supportedTypes,
  yamlToObject,
} from './utils';

export const parseResource = (data: string) => {
  const resource = yamlToObject(data) as Resource;

  // Validate values
  if (!resource.original || !supportedLanguages.includes(resource.original)) {
    throw new ValidationError('Resource should have a valid language code');
  }

  if (!resource.type || !supportedTypes.includes(resource.type)) {
    throw new ValidationError('Resource should have a valid type');
  }

  return resource;
};

export const parseResourcePath = (path: string) => {
  const pathElements = path.split('/');
  if (pathElements.length < 3) throw new Error('Invalid resource path');
  return {
    type: pathElements[1] as ResourceType,
    path: pathElements.slice(0, 3).join('/'),
  };
};

export const groupByResource = (files: ChangedFile[], baseUrl: string) => {
  const groupedResources = new Map<string, ChangedContent>();

  for (const file of files) {
    const { type, path: resourcePath } = parseResourcePath(file.path);

    const resource = groupedResources.get(resourcePath) || {
      type,
      path: resourcePath,
      sourceUrl: `${baseUrl}/blob/${file.commit}/${resourcePath}`,
      files: [],
    };

    resource.files.push({
      path: file.path.replace(resourcePath + '/', ''),
      commit: file.commit,
      time: file.time,
      data: file.data,
      kind: file.kind,
    });

    groupedResources.set(resourcePath, resource);
  }

  return Array.from(groupedResources.values());
};

export const processChangedResourceContent = (
  content: ChangedFile[],
  baseUrl: string
) => {
  const grouped = groupByResource(content, baseUrl);

  for (const resource of grouped) {
    processNewResource(resource);
  }
};

export const processNewResource = (resource: ChangedContent) => {
  console.log(resource);

  for (const file of resource.files) {
    if (file.path === 'resource.yml') {
      if (!file.data) throw new Error('Resource file should have data');

      const parsed = parseResource(file.data);
      console.log(`Parsed resource ${resource.path}: `, parsed);
    }
  }

  return;
};
