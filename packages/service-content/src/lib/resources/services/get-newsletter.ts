import { firstRow } from '@blms/database';
import type { GetNewsletterResponse } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getNewsletterQuery } from '../queries/get-newsletter.js';

export const createGetNewsletter = ({ postgres }: Dependencies) => {
  return async (
    id: number,
    language?: string,
  ): Promise<GetNewsletterResponse> => {
    const newsletter = await postgres
      .exec(getNewsletterQuery(id, language))
      .then(firstRow);

    if (!newsletter) {
      throw new Error('Newsletter not found');
    }

    return {
      ...newsletter,
      thumbnail: computeAssetCdnUrl(
        newsletter.lastCommit,
        newsletter.path,
        'thumbnail.webp',
      ),
    };
  };
};
