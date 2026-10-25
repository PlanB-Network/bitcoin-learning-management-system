import { sql } from '@blms/database';

/**
 * Log a user out everywhere, except from the session `keepSid` when given
 * (the one that is changing the password).
 */
export const revokeSessionsQuery = (uid: string, keepSid?: string) => {
  return sql`
    DELETE FROM users.sessions
    WHERE uid = ${uid}
    ${keepSid ? sql`AND sid <> ${keepSid}` : sql``};
  `;
};
