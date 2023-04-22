import { ChangedAsset, ChangedFile } from '@sovereign-academy/types';

export interface ChangedContent {
  path: string;
  type: string;
  sourceUrl: string;
  files: (ChangedFile | ChangedAsset)[];
}

export const isAsset = (
  file: ChangedFile | ChangedAsset
): file is ChangedAsset => 'url' in file;
