import type { Dependencies } from '../../../dependencies.js';
import { contributorIdExistsQuery } from '../queries/contributor-id-exists.js';

export const createCheckContributorIdExists =
  (dependencies: Dependencies) => async (id: string) => {
    const { postgres } = dependencies;

    const [result] = await postgres.exec(contributorIdExistsQuery(id));
    return result && result.exists;
  };
