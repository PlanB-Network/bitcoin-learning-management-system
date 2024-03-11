import type { Dependencies } from '../../dependencies.js';
import { getEventsQuery } from '../queries/index.js';

export const createGetEvents = (dependencies: Dependencies) => async () => {
  const { postgres } = dependencies;

  return postgres.exec(getEventsQuery());
};
