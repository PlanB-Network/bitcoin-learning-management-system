import type { Dependencies } from '../../dependencies.js';
import { getEducatorContentQuery } from '../queries/get-educator-content.js';

export const createGetEducatorContent = ({ postgres }: Dependencies) => {
  return async (
    language?: string,
    status?: string,
    id?: string,
    uid?: string,
  ) => {
    const content = await postgres.exec(
      getEducatorContentQuery(language, status, id, uid),
    );
    return content;
  };
};
