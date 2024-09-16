import type { Dependencies } from '../../dependencies.js';
import { getGlossaryWordsQuery } from '../queries/get-glossary-words.js';

export const createGetGlossaryWords = ({ postgres }: Dependencies) => {
  return async (language?: string) => {
    const result = await postgres.exec(getGlossaryWordsQuery(language));

    return result.map((word) => ({
      ...word,
    }));
  };
};
