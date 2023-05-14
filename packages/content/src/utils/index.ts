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
  assets: resource.assets,
});
