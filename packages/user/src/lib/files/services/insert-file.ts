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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    postgres
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .exec(insertUserFileQuery({ ...input, uid }))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(firstRow)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(rejectOnEmpty);
};
