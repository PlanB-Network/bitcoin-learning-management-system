import type { Dependencies } from '../../dependencies.js';
import { calculateEventSeats } from '../queries/calculate-event-seats.js';

export const createCalculateEventSeats =
  (dependencies: Dependencies) => async () => {
    const { postgres } = dependencies;

    await postgres.exec(calculateEventSeats());
  };
