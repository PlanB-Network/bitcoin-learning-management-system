import type {
  CareerCompanySize,
  CareerLanguageLevel,
  CareerRemote,
  CareerRoleLevel,
} from '@blms/constants';
import { sql } from '@blms/database';

interface UpdateCareerProfileOptions {
  careerProfileId: string;
  firstName: string;
  lastName?: string;
  country: string;
  email: string;
  linkedin?: string;
  github?: string;
  telegram?: string;
  otherContact?: string;
  languages: { languageCode: string; level: CareerLanguageLevel }[];
  isBitcoinCommunityParticipant: boolean;
  bitcoinCommunityText?: string;
  isBitcoinProjectParticipant: boolean;
  bitcoinProjectText?: string;
  roles: { roleId: string; level: CareerRoleLevel }[];
  companySizes: CareerCompanySize[];
  isAvailableFullTime: boolean;
  remoteWorkPreference: CareerRemote;
  expectedSalary?: string;
  availabilityStart?: string;
  cvUrl?: string;
  motivationLetter?: string;
  areTermsAccepted: boolean;
  allowReceivingEmails: boolean;
}

export const updateCareerProfileQuery = ({
  careerProfileId,
  firstName,
  lastName,
  country,
  email,
  linkedin,
  github,
  telegram,
  otherContact,
  isBitcoinCommunityParticipant,
  bitcoinCommunityText,
  isBitcoinProjectParticipant,
  bitcoinProjectText,
  isAvailableFullTime,
  remoteWorkPreference,
  expectedSalary,
  availabilityStart,
  cvUrl,
  motivationLetter,
  areTermsAccepted,
  allowReceivingEmails,
}: UpdateCareerProfileOptions) => {
  return sql`
        UPDATE users.career_profiles
        SET
            first_name = ${firstName},
            last_name = ${lastName},
            country = ${country},
            email = ${email},
            linkedin = ${linkedin},
            github = ${github},
            telegram = ${telegram},
            other_contact = ${otherContact},
            is_bitcoin_community_participant = ${isBitcoinCommunityParticipant},
            bitcoin_community_text = ${bitcoinCommunityText},
            is_bitcoin_project_participant = ${isBitcoinProjectParticipant},
            bitcoin_project_text = ${bitcoinProjectText},
            is_available_full_time = ${isAvailableFullTime},
            remote_work_preference = ${remoteWorkPreference},
            expected_salary = ${expectedSalary},
            availability_start = ${availabilityStart},
            cv_url = ${cvUrl},
            motivation_letter = ${motivationLetter},
            are_terms_accepted = ${areTermsAccepted},
            allow_receiving_emails = ${allowReceivingEmails},
            edited_at = NOW()
        WHERE id = ${careerProfileId}
        RETURNING *
        ;
    `;
};

export const deleteCareerProfileLanguagesQuery = (careerProfileId: string) => {
  return sql`
            DELETE FROM users.career_languages
            WHERE career_profile_id = ${careerProfileId}
        `;
};

export const updateCareerProfileLanguagesQuery = ({
  careerProfileId,
  languages,
}: UpdateCareerProfileOptions) => {
  return sql`
    INSERT INTO users.career_languages (
      career_profile_id, language_code, level
    )
    VALUES ${sql(
      languages.map((l) => [careerProfileId, l.languageCode, l.level]),
    )}
    ON CONFLICT DO NOTHING;
  `;
};

export const deleteCareerProfileRolesQuery = (careerProfileId: string) => {
  return sql`
            DELETE FROM users.career_roles
            WHERE career_profile_id = ${careerProfileId}
        `;
};

export const updateCareerProfileRolesQuery = ({
  careerProfileId,
  roles,
}: UpdateCareerProfileOptions) => {
  return sql`
    INSERT INTO users.career_roles (
      career_profile_id, role_id, level
    )
    VALUES ${sql(roles.map((r) => [careerProfileId, r.roleId, r.level]))}
    ON CONFLICT DO NOTHING;
  `;
};

export const deleteCareerProfileCompanySizesQuery = (
  careerProfileId: string,
) => {
  return sql`
            DELETE FROM users.career_company_sizes
            WHERE career_profile_id = ${careerProfileId}
        `;
};

export const updateCareerProfileCompanySizesQuery = ({
  careerProfileId,
  companySizes,
}: UpdateCareerProfileOptions) => {
  return sql`
    INSERT INTO users.career_company_sizes (
      career_profile_id, size
    )
    VALUES ${sql(companySizes.map((size) => [careerProfileId, size]))}
    ON CONFLICT DO NOTHING;
  `;
};
