import { sql } from '@blms/database';

/**
 * Query to get available languages
 */
export const getAvailableLanguagesQuery = () => {
  return sql`
    SELECT
      l.code,
      l.name
    FROM users.languages l
    ORDER BY l.name
  `;
};

/**
 * Query to update user role to contributor
 */
export const updateUserRoleToContributorQuery = (contributorId: string) => {
  return sql`
    UPDATE users.accounts
    SET role = 'contributor'
    WHERE uid = ${contributorId}
    AND role NOT IN ('contributor', 'admin', 'superadmin')
  `;
};

/**
 * Query to assign language to contributor
 */
export const assignLanguageToContributorQuery = (
  contributorId: string,
  languageCode: string,
) => {
  return sql`
    INSERT INTO users.reviewer_languages (reviewer_id, language_code, proficiency_level)
    VALUES (${contributorId}, ${languageCode}, 1)
    ON CONFLICT (reviewer_id, language_code)
    DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level
  `;
};
