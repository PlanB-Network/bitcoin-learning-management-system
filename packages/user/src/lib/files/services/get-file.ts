import { firstRow, rejectOnEmpty } from '@blms/database';

import type { Dependencies } from '#src/dependencies.js';

import {
  getUserFileMetadataQuery,
  getUserFileQuery,
} from '../queries/get-file.js';

export const createGetUserFileMetadata = ({ postgres }: Dependencies) => {
  return (id: string) =>
    postgres //
      .exec(getUserFileMetadataQuery(id))
      .then(firstRow)
      .then(rejectOnEmpty);
};

export const createGetUserFile = ({ postgres }: Dependencies) => {
  return (id: string) =>
    postgres //
      .exec(getUserFileQuery(id))
      .then(firstRow)
      .then(rejectOnEmpty);
};
