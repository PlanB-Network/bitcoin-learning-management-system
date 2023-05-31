import type { default as Builder } from '../sql/content/Builders';
import type { default as BuilderLocalized } from '../sql/content/BuildersLocalized';

import type { Resource } from '.';

export type { default as Builder } from '../sql/content/Builders';
export type { default as BuilderLocalized } from '../sql/content/BuildersLocalized';

export type JoinedBuilder = Pick<
  Resource,
  'id' | 'path' | 'last_updated' | 'last_commit'
> &
  Pick<
    Builder,
    'name' | 'website_url' | 'twitter_url' | 'github_url' | 'nostr'
  > &
  Pick<BuilderLocalized, 'language' | 'description'> & {
    tags: string[];
    category?: string;
  };
