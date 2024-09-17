import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getPodcastQuery } from '../queries/get-podcast.js';

export const createGetPodcast = ({ postgres }: Dependencies) => {
  return async (id: number, language?: string) => {
    const podcast = await postgres
      .exec(getPodcastQuery(id, language))
      .then(firstRow);

    if (!podcast) throw new Error('Podcast not found');

    return {
      ...podcast,
      logo: computeAssetCdnUrl(podcast.lastCommit, podcast.path, 'logo.webp'),
    };
  };
};
