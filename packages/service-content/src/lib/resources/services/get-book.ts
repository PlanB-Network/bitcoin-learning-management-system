import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBookQuery } from '../queries/get-book.js';

export const createGetBook = ({ postgres }: Dependencies) => {
  return async (id: number, language?: string) => {
    const book = await postgres.exec(getBookQuery(id, language)).then(firstRow);

    if (!book) throw new Error('Book not found');

    return {
      ...book,
      cover: book.cover
        ? computeAssetCdnUrl(book.lastCommit, book.path, book.cover)
        : undefined,
    };
  };
};
