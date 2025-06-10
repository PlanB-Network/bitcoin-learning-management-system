import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getNowQuery } from '../queries/get-now.js';

export const createGetNow = ({ postgres }: Pick<Dependencies, 'postgres'>) => {
  return () => {
    return postgres.exec(getNowQuery()).then(firstRow);
  };
};
