import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getPodcastsQuery } from '../queries/index.js';

export const createGetPodcasts =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres.exec(getPodcastsQuery(language));

    return result.map((row) => ({
      ...row,
      logo: computeAssetCdnUrl(
        process.env['CDN_URL'] || 'http://localhost:8080',
        row.lastCommit,
        row.path,
        'logo.jpeg',
      ),
    }));
  };
