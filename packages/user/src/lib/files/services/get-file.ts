import { firstRow, rejectOnEmpty } from '@sovereign-university/database';

import type { Dependencies } from '#src/dependencies.js';

import {
  getUserFileMetadataQuery,
  getUserFileQuery,
} from '../queries/get-file.js';

export const createGetUserFileMetadata = ({ postgres }: Dependencies) => {
  return (id: string) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    postgres
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .exec(getUserFileMetadataQuery(id))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(firstRow)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(rejectOnEmpty);
};

export const createGetUserFile = ({ postgres }: Dependencies) => {
  return (id: string) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    postgres
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .exec(getUserFileQuery(id))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(firstRow)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(rejectOnEmpty);
};
