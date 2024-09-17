import { hash } from 'argon2';

import { firstRow } from '@blms/database';
import type { UserDetails } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { newCredentialsUserQuery } from '../queries/new-credentials-user.js';

import { createCheckContributorIdExists } from './check-contributor-id-exists.js';
import { createGenerateUniqueContributorId } from './generate-unique-contributor-id.js';

interface Options {
  username: string;
  password: string;
  contributorId?: string;
  email?: string;
}

export const createNewCredentialsUser = (dependencies: Dependencies) => {
  const { postgres } = dependencies;

  const checkContributorIdExists = createCheckContributorIdExists(dependencies);

  const generateUniqueContributorId =
    createGenerateUniqueContributorId(dependencies);

  return async (options: Options): Promise<UserDetails> => {
    const contributorId =
      options.contributorId || (await generateUniqueContributorId());
    const passwordHash = await hash(options.password);

    if (await checkContributorIdExists(contributorId)) {
      // TODO: change this to a custom error that can me remapped to a TRPC error
      throw new Error('Contributor ID already exists');
    }

    return postgres
      .exec(
        newCredentialsUserQuery({
          ...options,
          passwordHash,
          contributorId,
        }),
      )
      .then(firstRow) as Promise<UserDetails>;
  };
};
