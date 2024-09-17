import { firstRow } from '@blms/database';
import type { JoinedGlossaryWord } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getGlossaryWordQuery } from '../queries/get-glossary-word.js';

export const createGetGlossaryWord = ({ postgres }: Dependencies) => {
  return async (
    strId: string,
    language?: string,
  ): Promise<JoinedGlossaryWord> => {
    const word = await postgres
      .exec(getGlossaryWordQuery(strId, language))
      .then(firstRow);

    if (!word) {
      throw new Error('Word not found');
    }

    return word;
  };
};
