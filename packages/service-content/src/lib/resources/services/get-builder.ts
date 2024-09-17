import { firstRow } from '@blms/database';
import type { GetBuilderResponse } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBuilderQuery } from '../queries/get-builder.js';

export const createGetBuilder = ({ postgres }: Dependencies) => {
  return async (id: number, language?: string): Promise<GetBuilderResponse> => {
    const builder = await postgres
      .exec(getBuilderQuery(id, language))
      .then(firstRow);

    if (!builder) {
      throw new Error('Builder not found');
    }

    return {
      ...builder,
      logo: computeAssetCdnUrl(builder.lastCommit, builder.path, 'logo.webp'),
    };
  };
};
