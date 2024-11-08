import { sql } from '@blms/database';

export const changeRoleQuery = (uid: string, role: string) => {
  return sql`
    UPDATE users.accounts
    SET role = ${role}
    WHERE uid = ${uid};
  `;
};

export const changeRoleToProfessorQuery = (
  uid: string,
  role: string,
  professorId: number | null,
) => {
  return sql`
    UPDATE users.accounts
    SET
      role = ${role},
      professor_id = ${professorId}
    WHERE uid = ${uid};
  `;
};
