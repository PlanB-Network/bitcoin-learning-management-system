import type { Dependencies } from '../../dependencies.js';
import { getRecentlySubmittedEducatorContentQuery } from '../queries/get-educator-content.js';

export const createGetRecentlySubmittedEducatorContent =
  ({ postgres }: Pick<Dependencies, 'postgres'>) =>
  async (since: Date) => {
    return postgres.exec(getRecentlySubmittedEducatorContentQuery(since));
  };
