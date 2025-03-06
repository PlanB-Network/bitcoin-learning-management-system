import { firstRow, rejectOnEmpty } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getTutorialMetaQuery } from '../queries/get-tutorial-meta.js';

interface Options {
  id: string;
  language: string;
}

export const createGetTutorialMeta = ({ postgres }: Dependencies) => {
  // TODO: Add output type
  return ({ id, language }: Options) => {
    return postgres
      .exec(getTutorialMetaQuery(id, language))
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
