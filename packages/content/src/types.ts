import { ChangedAssetFile, ChangedTextFile } from '@sovereign-academy/types';

import { ContentType, Language } from './const';

export interface ChangedContent {
  type: ContentType;
  path: string;
  sourceUrl: string;
  main?: ChangedTextFile;
  files: (ChangedTextFile & { language?: Language })[];
  assets: ChangedAssetFile[];
}
