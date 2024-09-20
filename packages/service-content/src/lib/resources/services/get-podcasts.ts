import type { GetPodcastResponse } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getPodcastsQuery } from '../queries/get-podcasts.js';

export const createGetPodcasts = ({ postgres }: Dependencies) => {
  return async (language?: string): Promise<GetPodcastResponse[]> => {
    const result = await postgres.exec(getPodcastsQuery(language));

    return result.map((row) => ({
      ...row,
      logo: computeAssetCdnUrl(row.lastCommit, row.path, 'logo.webp'),
    }));
  };
};
