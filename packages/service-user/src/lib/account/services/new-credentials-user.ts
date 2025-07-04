import { firstRow, rejectOnEmpty } from '@blms/database';
import type { UserAccount } from '@blms/types';
import { hash } from 'argon2';

import type { Dependencies } from '../../../dependencies.js';
import { newCredentialsUserQuery } from '../queries/new-credentials-user.js';

import { createGenerateUniqueContributorId } from './generate-unique-contributor-id.js';

interface Options {
  username: string;
  password: string;
  contributorId?: string;
  email: string | null;
  university: string | null;
}

export const createNewCredentialsUser = (dependencies: Dependencies) => {
  const { postgres } = dependencies;

  const genContributorId = createGenerateUniqueContributorId(dependencies);

  return async (options: Options): Promise<UserAccount> => {
    const contributorId = options.contributorId || (await genContributorId());
    const passwordHash = await hash(options.password);

    return postgres
      .exec(
        newCredentialsUserQuery({
          ...options,
          contributorId,
          passwordHash,
        }),
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
