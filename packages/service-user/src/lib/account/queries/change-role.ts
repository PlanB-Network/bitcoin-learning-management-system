import { sql } from '@blms/database';

export const changeRoleQuery = (
  uid: string,
  role: string,
  professorId: string | null,
) => {
  return sql`
    UPDATE users.accounts
    SET
      role = ${role},
      professor_id = ${professorId}
    WHERE uid = ${uid};
  `;
};
