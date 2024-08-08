import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getConferencesQuery } from '../queries/get-conferences.js';

export const createGetConferences =
  (dependencies: Dependencies) => async () => {
    const { postgres } = dependencies;

    const conferences = await postgres.exec(getConferencesQuery());

    return conferences.map((conference) => ({
      ...conference,
      thumbnail: computeAssetCdnUrl(
        conference.lastCommit,
        conference.path,
        'thumbnail.webp',
      ),
    }));
  };
