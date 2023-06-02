import { ChangedFile } from '@sovereign-academy/types';

import { ContentType, Language } from './const';

export interface ChangedContent {
  type: ContentType;
  path: string;
  main?: ChangedFile;
  files: (ChangedFile & { language?: Language })[];
}
