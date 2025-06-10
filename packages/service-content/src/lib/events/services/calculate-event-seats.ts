import type { Dependencies } from '../../dependencies.js';
import { calculateEventSeats } from '../queries/calculate-event-seats.js';

export const createCalculateEventSeats = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return () => {
    return postgres.exec(calculateEventSeats());
  };
};
