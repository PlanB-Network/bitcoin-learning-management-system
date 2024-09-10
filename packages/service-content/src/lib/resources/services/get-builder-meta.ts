import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBuilderMetaQuery } from '../queries/get-builder-meta.js';

export const createGetBuilderMeta = ({ postgres }: Dependencies) => {
  return async (id: number, language?: string) => {
    const builder = await postgres
      .exec(getBuilderMetaQuery(id, language))
      .then(firstRow);

    if (!builder) throw new Error('Builder not found');

    return {
      ...builder,
      logo: computeAssetCdnUrl(builder.lastCommit, builder.path, 'logo.webp'),
    };
  };
};
