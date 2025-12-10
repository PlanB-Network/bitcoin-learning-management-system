import type { Dependencies } from '../../dependencies.js';
import { unpublishEducatorContentQuery } from '../queries/unpublish-educator-content.js';

export const createUnpublishEducatorContent = ({ postgres }: Dependencies) => {
  return async (id: string) => {
    await postgres.exec(unpublishEducatorContentQuery(id));
  };
};
