import { sql } from '@blms/database';

export const changeCertificateNameQuery = (
  uid: string,
  certificateName: string,
) => {
  return sql`
    UPDATE users.accounts
    SET certificate_name = ${certificateName}
    WHERE uid = ${uid};
  `;
};
