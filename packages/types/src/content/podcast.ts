import type { default as Podcast } from '../sql/content/Podcasts.js';

import type { Resource } from './index.js';

export type { default as Podcast } from '../sql/content/Podcasts.js';

export type JoinedPodcast = Pick<
  Resource,
  'id' | 'path' | 'last_updated' | 'last_commit'
> &
  Pick<
    Podcast,
    | 'language'
    | 'name'
    | 'host'
    | 'description'
    | 'website_url'
    | 'twitter_url'
    | 'podcast_url'
    | 'nostr'
  > & {
    tags: string[];
  };
