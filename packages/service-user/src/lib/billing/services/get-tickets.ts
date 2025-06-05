import type { Dependencies } from '../../../dependencies.js';
import { getTicketsQuery } from '../queries/get-tickets.js';

export const createGetTickets = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return ({ uid }: { uid: string }) => {
    return postgres.exec(getTicketsQuery(uid));
  };
};
