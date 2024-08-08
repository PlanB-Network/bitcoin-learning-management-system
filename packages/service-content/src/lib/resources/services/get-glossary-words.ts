import type { Dependencies } from '../../dependencies.js';
import { getGlossaryWordsQuery } from '../queries/get-glossary-words.js';

export const createGetGlossaryWords =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres.exec(getGlossaryWordsQuery(language));

    return result.map((word) => ({
      ...word,
    }));
  };
