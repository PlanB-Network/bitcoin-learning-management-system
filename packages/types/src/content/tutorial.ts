import type { default as TutorialCredits } from '../sql/content/TutorialCredits.js';
import type { default as Tutorial } from '../sql/content/Tutorials.js';
import type { default as TutorialLocalized } from '../sql/content/TutorialsLocalized.js';

import type { JoinedBuilder } from './builder.js';
import type { JoinedProfessor } from './professor.js';

export type { default as Tutorial } from '../sql/content/Tutorials.js';
export type { default as TutorialLocalized } from '../sql/content/TutorialsLocalized.js';
export type { default as TutorialCredits } from '../sql/content/TutorialCredits.js';

export type JoinedTutorial = Pick<
  Tutorial,
  | 'id'
  | 'path'
  | 'name'
  | 'level'
  | 'category'
  | 'subcategory'
  | 'last_updated'
  | 'last_commit'
> &
  Pick<
    TutorialLocalized,
    'language' | 'title' | 'description' | 'raw_content'
  > & {
    tags: string[];
  } & {
    builder?: Omit<JoinedBuilder, 'tags'>;
  };

export type JoinedTutorialCredits = TutorialCredits & {
  professor?: JoinedProfessor;
};
