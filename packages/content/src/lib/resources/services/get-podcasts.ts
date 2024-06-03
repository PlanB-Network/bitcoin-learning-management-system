import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getPodcastsQuery } from '../queries/index.js';

export const createGetPodcasts =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres.exec(getPodcastsQuery(language));

    return result.map((row) => ({
      ...row,
      logo: computeAssetCdnUrl(row.lastCommit, row.path, 'logo.webp'),
    }));
  };
