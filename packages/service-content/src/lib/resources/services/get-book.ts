import { firstRow } from '@blms/database';
import type { JoinedBook } from '@blms/types';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import { getBookQuery } from '../queries/get-book.js';

export const createGetBook = ({ postgres }: Dependencies) => {
  return async (id: string, language?: string): Promise<JoinedBook> => {
    const book = await postgres.exec(getBookQuery(id, language)).then(firstRow);

    if (!book) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Book not found',
      });
    }

    return book;
  };
};
