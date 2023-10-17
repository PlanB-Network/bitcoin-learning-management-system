import { Dependencies } from '../../../dependencies';
import { contributorIdExistsQuery } from '../queries';

export const createCheckContributorIdExists =
  (dependencies: Dependencies) => async (id: string) => {
    const { postgres } = dependencies;

    const [result] = await postgres.exec(contributorIdExistsQuery(id));
    return result && result.exists;
  };
