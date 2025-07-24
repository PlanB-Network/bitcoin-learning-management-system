import { UserPermission, UserRole } from '@blms/constants';
import { sql } from '@blms/database';
import type { UserAccount } from '@blms/types';

interface NewCredentialsUserOptions {
  username: string;
  passwordHash: string;
  contributorId: string;
  email: string | null;
  university: string | null;
  isContributeApp?: boolean;
  permissions?: string[];
}

export const newCredentialsUserQuery = ({
  username,
  passwordHash,
  contributorId,
  email,
  university,
  isContributeApp = false,
  permissions = [],
}: NewCredentialsUserOptions) => {
  const role = isContributeApp ? UserRole.Contributor : UserRole.Student;

  // If this is a contributor user and no permissions are specified,
  // set default permissions to include reviewer capabilities
  let userPermissions = permissions;
  if (
    isContributeApp &&
    role === UserRole.Contributor &&
    permissions.length === 0
  ) {
    userPermissions = [UserPermission.ContributeReviewer];
  }

  return sql<UserAccount[]>`
    WITH inserted_user AS (
      INSERT INTO users.accounts (
        username,
        display_name,
        certificate_name,
        password_hash,
        email,
        university,
        contributor_id,
        role,
        permissions
      ) VALUES (
        ${username.toLowerCase()},
        ${username},
        ${username},
        ${passwordHash},
        ${email || null},
        ${university || null},
        ${contributorId},
        ${role},
        ${userPermissions}
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
