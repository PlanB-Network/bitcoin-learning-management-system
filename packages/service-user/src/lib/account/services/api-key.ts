import { firstRow, sql } from '@blms/database';
import type { ApiKey } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';

export const createGetActiveApiKey = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (key: string): Promise<ApiKey | null> => {
    return postgres
      .exec(
        sql<ApiKey[]>`
          SELECT id FROM users.api_keys
          WHERE id = ${key}
            AND revoked_at IS NULL
            AND (
              expires_at IS NULL
              OR
              expires_at > NOW()
            );`,
      )
      .then(firstRow)
      .then((row) => row || null);
  };
};
