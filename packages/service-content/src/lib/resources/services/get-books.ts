import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBooksQuery } from '../queries/get-books.js';

export const createGetBooks = ({ postgres }: Dependencies) => {
  return async (language?: string) => {
    const books = await postgres.exec(getBooksQuery(language));

    return books.map((book) => ({
      ...book,
      cover: book.cover
        ? computeAssetCdnUrl(book.lastCommit, book.path, book.cover)
        : undefined,
    }));
  };
};
