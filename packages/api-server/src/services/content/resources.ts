import { computeAssetRawUrl } from '@sovereign-academy/content';
import { Book, Resource } from '@sovereign-academy/types';

import { Dependencies } from '../../dependencies';

export const createGetBooks = (dependencies: Dependencies) => async () => {
  const { postgres } = dependencies;

  const result = await postgres<(Book & Resource)[]>`
      SELECT 
        b.id as book_id, b.resource_id, b.language,
        b.title, b.author, b.description, b.publication_date, b.cover,
        r.path, r.original_language, r.last_updated, r.last_commit
      FROM content.books b
      JOIN content.resources r ON r.id = b.resource_id
    `;

  /* return result.map((row) => ({
    ...row,
    cover:
      row.cover !== undefined && row.cover !== null
        ? computeAssetRawUrl(
            'https://github.com/blc-org/sovereignacademy-data',
            row.last_commit,
            row.path,
            row.cover
          )
        : undefined,
  })); */

  return [];
};
