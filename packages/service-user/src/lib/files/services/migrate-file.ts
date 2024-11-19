import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import type { UserFile } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

const getUserFileToMigrateQuery = () => {
  return sql<
    Array<Pick<UserFile, 'id'>>
  >`SELECT id FROM users.files WHERE s3 = false;`;
};

const getUserFileQuery = (id: string) => {
  return sql<UserFile[]>`SELECT * FROM users.files WHERE id = ${id};`;
};

const updateUserFileQuery = (id: string, s3Key: string) => {
  return sql`
    UPDATE users.files
    SET s3 = true, s3_key = ${s3Key}, data = NULL
    WHERE id = ${id}
    ;
  `;
};

export const createMigrateUserFiles = ({ postgres, s3 }: Dependencies) => {
  return async () => {
    const files = await postgres.exec(getUserFileToMigrateQuery());

    for (const file of files) {
      const userFile = await postgres
        .exec(getUserFileQuery(file.id))
        .then(firstRow)
        .then(rejectOnEmpty);

      console.log(`Migrating file ${userFile.id} to s3`);
      const s3Key = `user-files/${userFile.id}`;
      await s3.put(s3Key, userFile.data, userFile.mimetype);
      await postgres.exec(updateUserFileQuery(userFile.id, s3Key));
    }

    console.log('Migration to s3 complete');
  };
};
