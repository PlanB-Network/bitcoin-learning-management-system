import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getGlossaryWordQuery } from '../queries/get-glossary-word.js';

export const createGetGlossaryWord =
  (dependencies: Dependencies) => async (strId: string, language?: string) => {
    const { postgres } = dependencies;

    const word = await postgres
      .exec(getGlossaryWordQuery(strId, language))
      .then(firstRow);

    if (!word) throw new Error('Word not found');

    return word;
  };
