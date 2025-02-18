import { firstRow } from '@blms/database';
import type { JoinedBook } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getBookQuery } from '../queries/get-book.js';

export const createGetBook = ({ postgres }: Dependencies) => {
  return async (id: string, language?: string): Promise<JoinedBook> => {
    const book = await postgres.exec(getBookQuery(id, language)).then(firstRow);

    if (!book) {
      throw new Error('Book not found');
    }

    return book;
  };
};
