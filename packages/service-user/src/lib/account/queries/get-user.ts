import { sql } from '@blms/database';
import type { UserAccount } from '@blms/types';

type GetUserOptions =
  | {
      uid: string;
    }
  | {
      username: string;
    }
  | {
      lud4PublicKey: string;
    };

export const getUserQuery = (options: GetUserOptions) => {
  const [key, value] = Object.entries(options)[0];

  if (key === 'lud4PublicKey') {
    return sql<UserAccount[]>`
      SELECT a.* 
      FROM users.accounts a
      JOIN users.lud4_public_keys l ON a.uid = l.uid
      WHERE l.public_key = ${value};
    `;
  }

  return sql<UserAccount[]>`
    SELECT 
      ua.*, p.contributor_id, array_agg(DISTINCT cp.course_id) as professor_courses, array_agg(DISTINCT tp.tutorial_id) as professor_tutorials
    FROM users.accounts ua
    LEFT JOIN content.professors p ON ua.professor_id = p.id
    LEFT JOIN content.course_professors cp ON p.contributor_id = cp.contributor_id
    LEFT JOIN content.tutorial_credits tp ON p.contributor_id = tp.contributor_id
    WHERE ${sql(key)} ILIKE ${value}
    GROUP BY ua.uid ,p.contributor_id;
  `;
};

export const getUserByIdQuery = (uid: string) => {
  return sql<UserAccount[]>`
    SELECT * FROM users.accounts
    WHERE uid = ${uid};
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
