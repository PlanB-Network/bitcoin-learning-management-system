import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { getEventQuery } from '../queries/get-event.js';

export const createGetEvent =
  (dependencies: Dependencies) => async (id: string) => {
    const { postgres } = dependencies;

    return postgres.exec(getEventQuery(id)).then(firstRow);
  };
