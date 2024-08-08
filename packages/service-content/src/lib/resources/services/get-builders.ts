import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBuildersQuery } from '../queries/get-builders.js';

export const createGetBuilders =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres.exec(getBuildersQuery(language));

    return result.map((row) => ({
      ...row,
      logo: computeAssetCdnUrl(row.lastCommit, row.path, 'logo.webp'),
    }));
  };
