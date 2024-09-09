import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getConferenceMetaQuery } from '../queries/index.js';

export const createGetConferenceMeta = ({ postgres }: Dependencies) => {
  return async (id: number) => {
    const conference = await postgres
      .exec(getConferenceMetaQuery(id))
      .then(firstRow);

    if (!conference) throw new Error(`Conference ${id} not found`);

    return {
      ...conference,
      thumbnail: computeAssetCdnUrl(
        conference.lastCommit,
        conference.path,
        'thumbnail.webp',
      ),
    };
  };
};
