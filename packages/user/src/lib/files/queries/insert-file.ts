import { sql } from '@sovereign-university/database';
import type { UserFile } from '@sovereign-university/types';

type UserFileInput = Pick<
  UserFile,
  'uid' | 'data' | 'filename' | 'mimetype' | 'filesize' | 'checksum'
>;

export const insertUserFileQuery = (input: UserFileInput) => {
  return sql<Array<Omit<UserFile, 'data'>>>`
    INSERT INTO users.files (uid, filename, mimetype, filesize, checksum, data)
    VALUES (${input.uid}, ${input.filename}, ${input.mimetype}, ${input.filesize}, ${input.checksum}, ${input.data})
    RETURNING id, uid, s3, s3_key, filename, mimetype, filesize, checksum, created_at, updated_at
    ;
  `;
};
