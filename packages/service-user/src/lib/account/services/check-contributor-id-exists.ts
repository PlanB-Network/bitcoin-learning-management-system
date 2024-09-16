import type { Dependencies } from '../../../dependencies.js';
import { contributorIdExistsQuery } from '../queries/contributor-id-exists.js';

export const createCheckContributorIdExists = ({ postgres }: Dependencies) => {
  return async (id: string) => {
    const [result] = await postgres.exec(contributorIdExistsQuery(id));
    return result && result.exists;
  };
};
