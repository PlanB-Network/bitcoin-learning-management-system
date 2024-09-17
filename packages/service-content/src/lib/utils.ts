import yaml from 'js-yaml';

import { supportedContentTypes } from './const.js';
import type { ChangedContent } from './types.js';

export const yamlToObject = <T = unknown>(data: string) => yaml.load(data) as T;

export const getContentType = (path: string) => {
  const pathElements = path.split('/');

  // Validate that the path has at least 1 element (content/)
  if (pathElements.length === 0) {
    throw new Error('Invalid content path');
  }

  const contentType = supportedContentTypes.find((value) =>
    path.startsWith(value),
  );

  if (!contentType) {
    throw new Error(`Invalid content type path: ${path}`);
  }

  return contentType;
};

export const computeAssetCdnUrl = (
  commit: string,
  contentPath: string,
  assetPath: string,
) => `/cdn/${commit}/${contentPath}/assets/${assetPath}`;

export const separateContentFiles = (
  resource: ChangedContent,
  mainFileName: string,
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
  const fileName = pathElements.at(-1);
  if (!fileName) {
    throw new Error('Invalid file path');
  }

  const fileNameElements = fileName.split('.');
  return fileNameElements.at(-1);
};

export function convertStringToTimestamp(inputString: string) {
  const year = Number.parseInt(inputString.slice(0, 4));
  const month = Number.parseInt(inputString.slice(4, 6));
  const day = Number.parseInt(inputString.slice(6, 8));

  const dateObject = new Date(year, month - 1, day); // Note: month is zero-based in JavaScript Date objects

  return dateObject.getTime();
}

export const omit = <A extends object, B extends ReadonlyArray<keyof A>>(
  obj: A,
  arr: B,
) => {
  const omit = new Set(arr);
  const res = {} as Partial<A>;

  for (const key in obj) {
    if (!omit.has(key)) {
      res[key] = obj[key];
    }
  }

  return res as Omit<A, B[number]>;
};
