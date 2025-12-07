import type { Dependencies } from '../../dependencies.js';
import {
  approveEducatorContentQuery,
  mergeEducatorContentQuery,
} from '../queries/approve-educator-content.js';
import { getEducatorContentQuery } from '../queries/get-educator-content.js';

export const createApproveEducatorContent = ({ postgres }: Dependencies) => {
  return async (id: string) => {
    const [content] = await postgres.exec(
      getEducatorContentQuery(undefined, undefined, id),
    );

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.originalId) {
      await postgres.exec(mergeEducatorContentQuery(id, content.originalId));
      return;
    }

    await postgres.exec(approveEducatorContentQuery(id));
  };
};
