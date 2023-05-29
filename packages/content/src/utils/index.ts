import yaml from 'js-yaml';

import { assertSupportedContentPath } from '../const';
import { ChangedContent } from '../types';

export const yamlToObject = <T = unknown>(data: string) => yaml.load(data) as T;

export const getContentType = (path: string) => {
  const pathElements = path.split('/');

  // Validate that the path has at least 1 element (content/)
  if (pathElements.length < 1) throw new Error('Invalid content path');

  const rootPath = pathElements[0];
  assertSupportedContentPath(rootPath);

  return rootPath;
};

export const computeAssetRawUrl = (
  repositoryUrl: string,
  commit: string,
  contentPath: string,
  assetPath: string
) => `${repositoryUrl}/raw/${commit}/${contentPath}/assets/${assetPath}`;

export const separateContentFiles = (
  resource: ChangedContent,
  mainFileName: string
) => ({
  main: resource.files.find((file) => file.path === mainFileName),
  files: resource.files.filter((file) => file.path !== mainFileName),
});

/**
 * Get the relative path of the file compared to the item (course, resource, etc) directory
 * if it's a regular file or the item's assets directory if it's an asset.
 *
 * Examples:
 *  - `courses/btc101/en.yml` -> `en.yml`
 *  - `courses/btc101/assets/logo.png` -> `logo.png`
 *
 * @param fullPath - Full path of the file
 * @param directoryPath - Path of the item directory (optional), to be truncated from the full path
 * @returns Relative path of the file
 */
export const getRelativePath = (fullPath: string, directoryPath?: string) => {
  let path = fullPath;

  if (directoryPath) {
    path = fullPath.replace(directoryPath, '');
  }

  if (path.startsWith('/')) {
    path = path.slice(1);
  }

  const pathElements = path.split('/');
  return pathElements[0] === 'assets'
    ? pathElements.slice(1).join('/')
    : pathElements.join('/');
};

/**
 * Returns the file extension
 *
 * @param path - Path of the file
 * @returns File extension
 */
export const getFileExtension = (path: string) => {
  const pathElements = path.split('/');
  const fileName = pathElements[pathElements.length - 1];
  const fileNameElements = fileName.split('.');
  return fileNameElements[fileNameElements.length - 1];
};
