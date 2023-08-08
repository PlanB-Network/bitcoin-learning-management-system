import { ChangedFile } from '@sovereign-university/types';

import { ContentType, Language } from './const';

export interface ChangedContent {
  type: ContentType;
  path: string;
  main?: ChangedFile;
  files: (ChangedFile & { language?: Language })[];
}
