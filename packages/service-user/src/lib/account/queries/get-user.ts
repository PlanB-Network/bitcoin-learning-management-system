import { sql } from '@blms/database';
import type { UserAccount, UserDetails } from '@blms/types';

export const getUserByLud4PublicKey = (lud4PublicKey: string) => {
  return sql<UserAccount[]>`
    SELECT a.*
    FROM users.accounts a
    JOIN users.lud4_public_keys l ON a.uid = l.uid
    WHERE l.public_key = ${lud4PublicKey};
  `;
};

export const getUserByIdQuery = (uid: string) => {
  return sql<UserAccount[]>`
    SELECT * FROM users.accounts
    WHERE uid = ${uid};
  `;
};

export const getUsersByIdsQuery = (uids: string[]) => {
  return sql<UserAccount[]>`
    SELECT * FROM users.accounts
    WHERE uid = ANY(${uids});
  `;
};

export const getUserByIdWithDetailsQuery = (uid: string) => {
  return sql<UserDetails[]>`
    SELECT
      ua.*,
      COALESCE(array_agg(DISTINCT cp.course_id), '{}') AS professor_courses,
      COALESCE(array_agg(DISTINCT tu.id), '{}') AS professor_tutorials,
      COALESCE(array_agg(DISTINCT bc.course_id), '{}') AS bought_courses
    FROM users.accounts ua
    LEFT JOIN content.professors p ON ua.professor_id = p.id
    LEFT JOIN content.course_professors cp ON p.id = cp.professor_id AND cp.course_id IS NOT NULL
    LEFT JOIN content.tutorials tu ON p.id = tu.professor_id AND tu.id IS NOT NULL
    LEFT JOIN users.course_payment bc on ua.uid = bc.uid AND bc.payment_status = 'paid'
    WHERE ua.uid = ${uid}
    GROUP BY ua.uid, p.id;
  `;
};

export const getUserByUserNameQuery = (username: string) => {
  return sql<UserAccount[]>`
    SELECT * FROM users.accounts
    WHERE username = LOWER( ${username} );
  `;
};

export const getUserByEmailQuery = (email: string) => {
  // UserAccount & { email: string } is used to specify that the email field will be not null
  // at this point, the email field is not null because it is being used in the WHERE clause
  return sql<Array<UserAccount & { email: string }>>`
    SELECT * FROM users.accounts
    WHERE email = ${email};
  `;
};

export const getUserByUserNameOrEmailQuery = (usernameOrEmail: string) => {
  return sql<UserAccount[]>`
    SELECT * FROM users.accounts
    WHERE username = LOWER( ${usernameOrEmail} )
    OR email = LOWER( ${usernameOrEmail} );
  `;
};
