import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getNowQuery } from '../queries/index.js';

export const createGetNow = (dependencies: Dependencies) => async () => {
  const { postgres } = dependencies;

  return postgres.exec(getNowQuery()).then(firstRow);
};
