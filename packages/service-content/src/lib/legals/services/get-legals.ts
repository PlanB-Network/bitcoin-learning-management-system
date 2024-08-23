/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { Dependencies } from '../../dependencies.js';
import { getLegalsQuery } from '../queries/get-legals.js';

export const createGetLegals = (dependencies: Dependencies) => {
  return async (language?: string) => {
    const { postgres } = dependencies;

    const legals = await postgres.exec(getLegalsQuery(language));

    return [...legals];
  };
};
