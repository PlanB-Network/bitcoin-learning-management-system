import { ChangedFile } from '@sovereign-university/types';

import { ContentType, Language } from './const';

export type ChangedFileWithLanguage = ChangedFile & { language?: Language };

export interface ChangedContent {
  type: ContentType;
  path: string;
  main?: ChangedFile;
  files: ChangedFileWithLanguage[];
}
