import { firstRow, rejectOnEmpty } from '@sovereign-university/database';

import type { Dependencies } from '#src/dependencies.js';

import { setProfilePictureQuery } from '../queries/set-profile-picture.js';

export const createSetProfilePicture = ({ postgres }: Dependencies) => {
  return (uid: string, fileId: string) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    postgres
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .exec(setProfilePictureQuery(uid, fileId))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(firstRow)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(rejectOnEmpty);
};
