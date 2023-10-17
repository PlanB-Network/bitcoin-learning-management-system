import { firstRow } from '@sovereign-university/database';
import { UserDetails } from '@sovereign-university/types';

import { Dependencies } from '../../../dependencies';
import { newLnurlUserQuery } from '../queries';

import { createGenerateUniqueContributorId } from './generate-unique-contributor-id';

interface NewLnurlUser {
  (options: { publicKey: string }): Promise<UserDetails>;
}

export const createNewLnurlUser =
  (dependencies: Dependencies): NewLnurlUser =>
  async ({ publicKey }) => {
    const { postgres } = dependencies;

    const generateUniqueContributorId =
      createGenerateUniqueContributorId(dependencies);

    const username = publicKey.slice(0, 10);
    const contributorId = await generateUniqueContributorId();

    return postgres
      .exec(
        newLnurlUserQuery({
          username,
          publicKey,
          contributorId,
        }),
      )
      .then(firstRow) as Promise<UserDetails>;
  };
