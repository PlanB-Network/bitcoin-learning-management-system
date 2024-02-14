import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBookQuery } from '../queries/index.js';

export const createGetBook =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const book = await postgres.exec(getBookQuery(id, language)).then(firstRow);

    if (book) {
      return {
        ...book,
        cover: book.cover
          ? computeAssetCdnUrl(
              process.env['CDN_URL'] || 'http://localhost:8080',
              book.last_commit,
              book.path,
              book.cover,
            )
          : undefined,
      };
    }
  };
