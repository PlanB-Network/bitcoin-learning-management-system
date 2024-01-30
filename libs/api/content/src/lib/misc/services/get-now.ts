import { firstRow } from '@sovereign-university/database';

import { Dependencies } from '../../dependencies';
import { getNowQuery } from '../queries';

export const createGetNow = (dependencies: Dependencies) => async () => {
  const { postgres } = dependencies;

  return postgres.exec(getNowQuery()).then(firstRow);
};
