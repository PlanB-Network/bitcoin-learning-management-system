import { firstRow } from '@sovereign-university/database';
import { Dependencies } from '../../../dependencies';
import { getUserQuery } from '../queries';

type GetUserOptions =
  | {
      uid: string;
    }
  | {
      username: string;
    };

export const createGetUser =
  (dependencies: Dependencies) => async (options: GetUserOptions) => {
    const { postgres } = dependencies;

    return postgres.exec(getUserQuery(options)).then(firstRow);
  };
