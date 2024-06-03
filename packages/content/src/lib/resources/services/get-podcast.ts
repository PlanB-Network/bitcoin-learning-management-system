import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getPodcastQuery } from '../queries/index.js';

export const createGetPodcast =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const podcast = await postgres
      .exec(getPodcastQuery(id, language))
      .then(firstRow);

    if (!podcast) throw new Error('Podcast not found');

    return {
      ...podcast,
      logo: computeAssetCdnUrl(podcast.lastCommit, podcast.path, 'logo.webp'),
    };
  };
