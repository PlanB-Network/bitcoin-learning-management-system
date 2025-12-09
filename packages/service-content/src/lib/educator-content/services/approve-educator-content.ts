import type { Dependencies } from '../../dependencies.js';
import {
  approveEducatorContentQuery,
  mergeEducatorContentQuery,
} from '../queries/approve-educator-content.js';

export const createApproveEducatorContent = ({ postgres }: Dependencies) => {
  return async (id: string, originalId?: string) => {
    if (originalId) {
      await postgres.exec(mergeEducatorContentQuery(id, originalId));
      return;
    }

    await postgres.exec(approveEducatorContentQuery(id));
  };
};
