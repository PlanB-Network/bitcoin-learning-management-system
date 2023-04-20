import type { ChangedFile } from '@sovereign-academy/types';

import { processChangedResourceContent } from './parser';

const getContentType = (path: string) => {
  const pathElements = path.split('/');
  if (pathElements.length < 2) return 'unknown';
  return pathElements[0];
};

export const processChangedFiles = async (
  content: ChangedFile[],
  baseUrl: string
) => {
  processChangedResourceContent(
    content.filter((item) => getContentType(item.path) === 'resources'),
    baseUrl
  );
};
