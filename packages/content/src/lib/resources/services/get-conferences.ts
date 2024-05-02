import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getConferencesQuery } from '../queries/index.js';

export const createGetConferences =
  (dependencies: Dependencies) => async () => {
    const { postgres } = dependencies;

    const conferences = await postgres.exec(getConferencesQuery());

    return conferences.map((conference) => ({
      ...conference,
      thumbnail: computeAssetCdnUrl(
        process.env['CDN_URL'] || 'http://localhost:8080',
        conference.lastCommit,
        conference.path,
        'thumbnail.webp',
      ),
    }));
  };
