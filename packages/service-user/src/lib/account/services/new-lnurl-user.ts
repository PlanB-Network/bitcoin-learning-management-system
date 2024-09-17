import { firstRow } from '@blms/database';
import type { UserDetails } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { newLnurlUserQuery } from '../queries/new-lnurl-user.js';

import { createGenerateUniqueContributorId } from './generate-unique-contributor-id.js';

interface Options {
  publicKey: string;
}

export const createNewLnurlUser = (dependencies: Dependencies) => {
  const { postgres } = dependencies;

  const generateUniqueContributorId =
    createGenerateUniqueContributorId(dependencies);

  return async ({ publicKey }: Options): Promise<UserDetails> => {
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
};
