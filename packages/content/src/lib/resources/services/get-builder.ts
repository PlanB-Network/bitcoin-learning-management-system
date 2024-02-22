import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBuilderQuery } from '../queries/index.js';

export const createGetBuilder =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const builder = await postgres
      .exec(getBuilderQuery(id, language))
      .then(firstRow);

    if (builder) {
      return {
        ...builder,
        logo: computeAssetCdnUrl(
          process.env['CDN_URL'] || 'http://localhost:8080',
          builder.lastCommit,
          builder.path,
          'logo.jpeg',
        ),
      };
    }
  };
