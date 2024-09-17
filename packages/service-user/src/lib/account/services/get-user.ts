import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { getUserQuery } from '../queries/get-user.js';

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

export const createGetUser = ({ postgres }: Dependencies) => {
  return (options: GetUserOptions) => {
    return postgres.exec(getUserQuery(options)).then(firstRow);
  };
};
