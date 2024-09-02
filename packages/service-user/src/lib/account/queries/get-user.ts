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
      ua.*, 
      p.contributor_id, 
      p.name AS professor_name,
      p.path AS professor_path,
      p.twitter_url as professor_twitter_url,
      p.website_url as professor_website_url,
      p.github_url as professor_github_url,
      p.nostr as professor_nostr,
      p.lightning_address AS professor_lightning_address,
      p.last_commit AS professor_last_commit,
      array_agg(DISTINCT cp.course_id) AS professor_courses, 
      array_agg(DISTINCT tp.tutorial_id) AS professor_tutorials, 
      json_object_agg(COALESCE(pl.language, ''), COALESCE(pl.short_bio, '')) AS professor_short_bio,
      array_agg(DISTINCT t.name) AS professor_tags
    FROM users.accounts ua
    LEFT JOIN content.professors p ON ua.professor_id = p.id
    LEFT JOIN content.course_professors cp ON p.contributor_id = cp.contributor_id
    LEFT JOIN content.tutorial_credits tp ON p.contributor_id = tp.contributor_id
    LEFT JOIN content.professors_localized pl ON ua.professor_id = pl.professor_id
    LEFT JOIN content.professor_tags pt ON ua.professor_id = pt.professor_id
    LEFT JOIN content.tags t ON pt.tag_id = t.id
    WHERE ${sql(key)} ILIKE ${value}
    GROUP BY ua.uid, p.contributor_id, p.name, p.path, p.twitter_url, p.website_url, p.github_url, p.nostr, p.lightning_address, p.last_commit;
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
