import { firstRow, rejectOnEmpty } from '@sovereign-university/database';
import type { UserFile } from '@sovereign-university/types';

import type { Dependencies } from '#src/dependencies.js';

import { insertUserFileQuery } from '../queries/insert-file.js';

type UserFileInput = Pick<
  UserFile,
  'data' | 'filename' | 'mimetype' | 'filesize' | 'checksum'
>;

export const createInsertFile = ({ postgres }: Dependencies) => {
  return (uid: string, input: UserFileInput): Promise<Omit<UserFile, 'data'>> =>
    postgres //
      .exec(insertUserFileQuery({ ...input, uid }))
      .then(firstRow)
      .then(rejectOnEmpty);
};
