import { sql } from '@blms/database';
import type { UserAccount } from '@blms/types';

interface NewCredentialsUserOptions {
  username: string;
  passwordHash: string;
  contributorId: string;
  email: string | null;
  university: string | null;
}

export const newCredentialsUserQuery = ({
  username,
  passwordHash,
  contributorId,
  email,
  university,
}: NewCredentialsUserOptions) => {
  return sql<UserAccount[]>`
    WITH inserted_user AS (
      INSERT INTO users.accounts (
        username,
        display_name,
        certificate_name,
        password_hash,
        email,
        university,
        contributor_id
      ) VALUES (
        ${username.toLowerCase()},
        ${username},
        ${username},
        ${passwordHash},
        ${email || null},
        ${university || null},
        ${contributorId}
      )
      RETURNING
        uid,
        username,
        display_name,
        certificate_name,
        contributor_id,
        email,
        university,
        role,
        permissions
    ), inserted_settings AS (
      INSERT INTO users.account_settings (
        uid,
        platform_notify_events,
        platform_notify_courses,
        platform_notify_general,
        email_notify_courses,
        email_notify_general
      )
      SELECT
        uid,
        true,
        true,
        true,
        true,
        true
      FROM inserted_user
      RETURNING uid
    )
    SELECT
      uid,
      username,
      display_name,
      certificate_name,
      contributor_id,
      email,
      university,
      role,
      permissions
    FROM inserted_user;
  `;
};
