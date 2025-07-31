import { sql } from '@blms/database';
import type { JoinedCareerProfile } from '@blms/types';

export const getCareerProfilesQuery = () => {
  return sql<JoinedCareerProfile[]>`
        SELECT
            cp.*,
            COALESCE(json_agg(DISTINCT jsonb_build_object('language_code', cl.language_code, 'level', cl.level)) FILTER (WHERE cl.language_code IS NOT NULL), '[]') AS languages,
            COALESCE(json_agg(DISTINCT jsonb_build_object('role_id', cr.role_id, 'level', cr.level)) FILTER (WHERE cr.role_id IS NOT NULL), '[]') AS roles,
            COALESCE(json_agg(DISTINCT ccs.size) FILTER (WHERE ccs.size IS NOT NULL), '[]') AS company_sizes,
            COALESCE(
                json_agg(
                    DISTINCT (
                        jsonb_build_object('course_id', cpr.course_id) ||
                        jsonb_build_object('progress_percentage', cpr.progress_percentage) ||
                        CASE WHEN cpr.total_score IS NOT NULL THEN jsonb_build_object('total_score', cpr.total_score) ELSE '{}'::jsonb END ||
                        CASE WHEN cpr.ranking IS NOT NULL THEN jsonb_build_object('ranking', cpr.ranking) ELSE '{}'::jsonb END ||
                        CASE WHEN cpr.total_students IS NOT NULL THEN jsonb_build_object('total_students', cpr.total_students) ELSE '{}'::jsonb END
                    )
                ),
                '[]'
            ) AS courses
        FROM users.career_profiles cp
        LEFT JOIN users.career_languages cl ON cp.id = cl.career_profile_id
        LEFT JOIN users.career_roles cr ON cp.id = cr.career_profile_id
        LEFT JOIN users.career_company_sizes ccs ON cp.id = ccs.career_profile_id
        LEFT JOIN (
            SELECT
                uid,
                course_id,
                progress_percentage,
                total_score,
                ranking,
                COUNT(*) OVER (PARTITION BY course_id) as total_students
            FROM users.course_progress
        ) cpr ON cp.uid = cpr.uid
        WHERE cp.are_terms_accepted = true AND cp.allow_receiving_emails = true
        GROUP BY cp.id;
    `;
};
