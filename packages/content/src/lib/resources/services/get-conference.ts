import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getConferenceQuery } from '../queries/index.js';

export const createGetConference =
  (dependencies: Dependencies) => async (id: number) => {
    const { postgres } = dependencies;

    const conference = await postgres
      .exec(getConferenceQuery(id))
      .then(firstRow);

    if (!conference) throw new Error('Conference not found');

    return {
      ...conference,
      thumbnail: computeAssetCdnUrl(
        process.env['CDN_URL'] || 'http://localhost:8080',
        conference.lastCommit,
        conference.path,
        'thumbnail.webp',
      ),
    };
  };
