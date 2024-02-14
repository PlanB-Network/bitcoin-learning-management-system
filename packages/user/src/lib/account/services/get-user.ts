import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../../dependencies.js';
import { getUserQuery } from '../queries/index.js';

type GetUserOptions =
  | {
      uid: string;
    }
  | {
      username: string;
    }
  | {
      lud4PublicKey: string;
    };

export const createGetUser =
  (dependencies: Dependencies) => async (options: GetUserOptions) => {
    const { postgres } = dependencies;

    return postgres.exec(getUserQuery(options)).then(firstRow);
  };
