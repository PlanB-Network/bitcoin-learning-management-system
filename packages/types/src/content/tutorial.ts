import type { default as Tutorial } from '../sql/content/Tutorials';
import type { default as TutorialLocalized } from '../sql/content/TutorialsLocalized';

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
  Pick<TutorialLocalized, 'language' | 'name' | 'raw_content'> & {
    tags: string[];
  };
