import { sql } from '@sovereign-university/database';
import type { UserFile } from '@sovereign-university/types';

export const getUserFileMetadataQuery = (id: string) => {
  return sql<Array<Omit<UserFile, 'data'>>>`
    SELECT id, uid, s3, s3_key, filename, mimetype, filesize, checksum, created_at, updated_at
    FROM users.files
    WHERE id = ${id}
    ;
  `;
};

export const getUserFileQuery = (id: string) => {
  return sql<UserFile[]>`
    SELECT *
    FROM users.files
    WHERE id = ${id}
    ;
  `;
};
