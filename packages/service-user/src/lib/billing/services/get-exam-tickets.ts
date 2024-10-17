import type { Ticket } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getExamTicketsQuery } from '../queries/get-exam-tickets.js';

interface Options {
  uid: string;
}

export const createGetExamTickets = ({ postgres }: Dependencies) => {
  return ({ uid }: Options): Promise<Ticket[]> => {
    return postgres.exec(getExamTicketsQuery(uid));
  };
};
