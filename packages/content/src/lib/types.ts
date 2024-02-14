import type { ChangedFile } from '@sovereign-university/types';

import type { ContentType, Language } from './const.js';

export type ChangedFileWithLanguage = ChangedFile & { language?: Language };

export interface ChangedContent {
  type: ContentType;
  path: string;
  main?: ChangedFile;
  files: ChangedFileWithLanguage[];
}
