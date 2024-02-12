import type { default as Builder } from '../sql/content/Builders.js';
import type { default as BuilderLocalized } from '../sql/content/BuildersLocalized.js';

import type { Resource } from './index.js';

export type { default as Builder } from '../sql/content/Builders.js';
export type { default as BuilderLocalized } from '../sql/content/BuildersLocalized.js';

export type JoinedBuilder = Pick<
  Resource,
  'id' | 'path' | 'last_updated' | 'last_commit'
> &
  Pick<
    Builder,
    'name' | 'category' | 'website_url' | 'twitter_url' | 'github_url' | 'nostr'
  > &
  Pick<BuilderLocalized, 'language' | 'description'> & {
    tags: string[];
    category?: string;
  };
