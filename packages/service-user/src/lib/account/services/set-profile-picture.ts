import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import type { UserDetails } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

const getOldPictureIdQuery = (uid: string) => {
  return sql<Array<Pick<UserDetails, 'picture'>>>`
    SELECT picture
    FROM users.accounts
    WHERE uid = ${uid};
  `;
};

const deleteOldPictureQuery = (oldPictureId: string) => {
  return sql`
    DELETE FROM users.files
    WHERE id = ${oldPictureId};
  `;
};

const setProfilePictureQuery = (uid: string, fileId: string) => {
  return sql<UserDetails[]>`
    UPDATE users.accounts
    SET picture = ${fileId}
    WHERE uid = ${uid}
    RETURNING
      uid,
      username,
      display_name,
      certificate_name,
      email,
      picture,
      contributor_id,
      created_at;
  `;
};

export const createSetProfilePicture = ({ postgres, s3 }: Dependencies) => {
  return async (uid: string, fileId: string) => {
    const oldPictureId = await postgres
      .exec(getOldPictureIdQuery(uid))
      .then(firstRow)
      .then((a) => a?.picture ?? null);

    if (oldPictureId) {
      try {
        await s3.delete(`user-files/${oldPictureId}`);
        await postgres.exec(deleteOldPictureQuery(oldPictureId));
      } catch (error) {
        console.error('Failed to delete old picture', oldPictureId, error);
      }
    }

    return postgres
      .exec(setProfilePictureQuery(uid, fileId))
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
