import { firstRow, rejectOnEmpty } from '@blms/database';

import type { Dependencies } from '#src/dependencies.js';

import { setProfilePictureQuery } from '../queries/set-profile-picture.js';

export const createSetProfilePicture = ({ postgres }: Dependencies) => {
  return (uid: string, fileId: string) =>
    postgres
      .exec(setProfilePictureQuery(uid, fileId))
      .then(firstRow)
      .then(rejectOnEmpty);
};
