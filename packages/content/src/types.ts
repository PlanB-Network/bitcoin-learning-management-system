import { ChangedFile } from '@sovereign-academy/types';

export interface ChangedContent {
  path: string;
  type: string;
  sourceUrl: string;
  files: ChangedFile[];
}
