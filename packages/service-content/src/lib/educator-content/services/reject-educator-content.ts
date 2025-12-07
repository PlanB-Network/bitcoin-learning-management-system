import type { Dependencies } from '../../dependencies.js';
import { rejectEducatorContentQuery } from '../queries/reject-educator-content.js';

export const createRejectEducatorContent = ({ postgres }: Dependencies) => {
  return async (id: string) => {
    await postgres.exec(rejectEducatorContentQuery(id));
  };
};
