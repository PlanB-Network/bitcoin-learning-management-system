import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { getEventQuery } from '../queries/get-event.js';

export const createGetEvent =
  (dependencies: Dependencies) => async (id: string) => {
    const { postgres } = dependencies;

    const event = await postgres.exec(getEventQuery(id)).then(firstRow);

    if (!event) {
      throw new Error(`Event ${id} not found`);
    }

    return event;
  };
