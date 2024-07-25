import type { ChangedFile } from '@blms/types';

import type { ContentType, Language } from './const.js';

export type ChangedFileWithLanguage = ChangedFile & { language?: Language };

export interface ChangedContent {
  type: ContentType;
  path: string;
  fullPath: string;
  main?: ChangedFile;
  files: ChangedFileWithLanguage[];
}
