import { firstRow, rejectOnEmpty } from '@blms/database';
import type { UserFile } from '@blms/types';

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
