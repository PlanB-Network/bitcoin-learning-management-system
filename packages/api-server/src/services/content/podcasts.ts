import { Podcast, Resource } from '@sovereign-academy/types';

import { Dependencies } from '../../dependencies';

type JoinedPodcast = Pick<
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
  >;

export const createGetPodcasts =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres<JoinedPodcast[]>`
      SELECT 
        r.id, r.path, p.language, p.name, p.host, p.description, p.website_url, 
        p.twitter_url, p.podcast_url, p.nostr, r.last_updated, r.last_commit
      FROM content.podcasts p
      JOIN content.resources r ON r.id = p.resource_id
      ${language ? postgres`WHERE p.language = ${language}` : postgres``}
    `;

    return result;
  };
