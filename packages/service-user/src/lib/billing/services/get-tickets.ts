import type { Dependencies } from '../../../dependencies.js';
import { getTicketsQuery } from '../queries/get-tickets.js';

export const createGetTickets =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getTicketsQuery(uid));
  };
