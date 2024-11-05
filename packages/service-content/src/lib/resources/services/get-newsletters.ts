import type { GetNewsletterResponse } from '@blms/types';

import type { Dependencies } from '#src/lib/dependencies.js';

import { computeAssetCdnUrl } from '../../utils.js';
import { getNewslettersQuery } from '../queries/get-newsletters.js';

export const createGetNewsletters = ({ postgres }: Dependencies) => {
  return async (language?: string): Promise<GetNewsletterResponse[]> => {
    const newsletters = await postgres.exec(getNewslettersQuery(language));

    return newsletters.map((newsletter) => ({
      ...newsletter,
      thumbnail: computeAssetCdnUrl(
        newsletter.lastCommit,
        newsletter.path,
        'thumbnail.webp',
      ),
    }));
  };
};
