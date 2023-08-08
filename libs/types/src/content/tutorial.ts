import type { default as Tutorial } from '../sql/content/Tutorials';
import type { default as TutorialLocalized } from '../sql/content/TutorialsLocalized';

import { JoinedBuilder } from './builder';

export type { default as Tutorial } from '../sql/content/Tutorials';
export type { default as TutorialLocalized } from '../sql/content/TutorialsLocalized';

export type JoinedTutorial = Pick<
  Tutorial,
  | 'id'
  | 'path'
  | 'level'
  | 'category'
  | 'subcategory'
  | 'last_updated'
  | 'last_commit'
> &
  Pick<
    TutorialLocalized,
    'language' | 'name' | 'description' | 'raw_content'
  > & {
    tags: string[];
  } & {
    builder?: Omit<JoinedBuilder, 'tags'>;
  };
