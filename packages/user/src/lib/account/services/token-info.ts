import {
  EmptyResultError,
  firstRow,
  rejectOnEmpty,
} from '@sovereign-university/database';

import type { Dependencies } from '#src/dependencies.js';

import { getTokenInfoQuery } from '../queries/token.js';

export const createGetTokenInfo = ({ postgres }: Dependencies) => {
  return (id: string) => {
    return postgres
      .exec(getTokenInfoQuery(id))
      .then(firstRow)
      .then(rejectOnEmpty)
      .catch((error) => {
        if (error instanceof EmptyResultError) {
          return null;
        }

        throw error;
      });
  };
};
