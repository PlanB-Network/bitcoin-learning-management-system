import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getLegalQuery } from '../queries/get-legal.js';

interface Options {
  name: string;
  language?: string;
}

export const createGetLegal = ({ postgres }: Dependencies) => {
  return async ({ name, language }: Options) => {
    const legal = await postgres
      .exec(getLegalQuery(name, language))
      .then(firstRow);

    if (!legal) {
      throw new Error(`Legal document not found`);
    }

    return legal;
  };
};
