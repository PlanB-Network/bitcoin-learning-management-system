import type { JoinedGlossaryWord } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getGlossaryWordsQuery } from '../queries/get-glossary-words.js';

export const createGetGlossaryWords = ({ postgres }: Dependencies) => {
  return (language?: string): Promise<JoinedGlossaryWord[]> => {
    return postgres.exec(getGlossaryWordsQuery(language));
  };
};
