import type { Dependencies } from '../../../dependencies.js';
import { contributorIdExistsQuery } from '../queries/contributor-id-exists.js';
import { generateRandomContributorId } from '../utils/contribution.js';

export const createGenerateUniqueContributorId = ({
  postgres,
}: Dependencies) => {
  const contributorIdExists = async (id: string) => {
    const [result] = await postgres.exec(contributorIdExistsQuery(id));
    return result && result.exists;
  };

  return async () => {
    let contributorId: string;

    do {
      contributorId = generateRandomContributorId();
    } while (await contributorIdExists(contributorId));

    return contributorId;
  };
};
