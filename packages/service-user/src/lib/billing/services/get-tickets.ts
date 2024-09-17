import type { Dependencies } from '../../../dependencies.js';
import { getTicketsQuery } from '../queries/get-tickets.js';

export const createGetTickets = ({ postgres }: Dependencies) => {
  return ({ uid }: { uid: string }) => {
    return postgres.exec(getTicketsQuery(uid));
  };
};
