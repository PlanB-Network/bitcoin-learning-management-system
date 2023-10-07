import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import { computeAssetCdnUrl } from '../../utils';
import { getPodcastQuery } from '../queries';

export const createGetPodcast =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const podcast = await postgres
      .exec(getPodcastQuery(id, language))
      .then(firstRow);

    if (podcast) {
      return {
        ...podcast,
        logo: computeAssetCdnUrl(
          process.env['CDN_URL'] || 'http://localhost:8080',
          podcast.last_commit,
          podcast.path,
          'logo.jpeg',
        ),
      };
    }

    return;
  };
