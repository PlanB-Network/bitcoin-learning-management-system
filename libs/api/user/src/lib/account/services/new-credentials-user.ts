import { UserDetails } from '@sovereign-university/types';
import { Dependencies } from '../../../dependencies';
import { newCredentialsUserQuery } from '../queries/new-credentials-user';
import { firstRow } from '@sovereign-university/database';

interface NewCredentialsUser {
  (options: {
    username: string;
    passwordHash: string;
    contributorId: string;
    email?: string;
  }): Promise<UserDetails>;
}

export const createNewCredentialsUser =
  (dependencies: Dependencies): NewCredentialsUser =>
  (options) => {
    const { postgres } = dependencies;

    return postgres
      .exec(newCredentialsUserQuery(options))
      .then(firstRow) as Promise<UserDetails>;
  };
