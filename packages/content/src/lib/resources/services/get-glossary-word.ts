import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { getGlossaryWordQuery } from '../queries/index.js';

export const createGetGlossaryWord =
  (dependencies: Dependencies) => async (strId: string, language?: string) => {
    const { postgres } = dependencies;

    const word = await postgres
      .exec(getGlossaryWordQuery(strId, language))
      .then(firstRow);

    if (!word) throw new Error('Word not found');

    return {
      ...word,
    };
  };
