import { firstRow, rejectOnEmpty } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getTutorialMetaQuery } from '../queries/get-tutorial-meta.js';

interface Options {
  category: string;
  name: string;
  language: string;
}

export const createGetTutorialMeta = ({ postgres }: Dependencies) => {
  // TODO: Add output type
  return ({ category, name, language }: Options) => {
    return postgres
      .exec(getTutorialMetaQuery(category, name, language))
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
