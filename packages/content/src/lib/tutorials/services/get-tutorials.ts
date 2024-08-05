/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { Dependencies } from '../../dependencies.js';
import { getTutorialsQuery } from '../queries/get-tutorials.js';

export const createGetTutorials = (dependencies: Dependencies) => {
  return async (category?: string, language?: string) => {
    const { postgres } = dependencies;

    const tutorials = await postgres.exec(
      getTutorialsQuery(category, language),
    );

    return [...tutorials];
  };
};
