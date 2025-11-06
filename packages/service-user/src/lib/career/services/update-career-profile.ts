import type {
  CareerCompanySize,
  CareerLanguageLevel,
  CareerRemote,
  CareerRoleLevel,
} from '@blms/constants';

import { firstRow } from '@blms/database';
import { TRPCError } from '@trpc/server';
import type { Dependencies } from '../../../dependencies.js';
import { getCareerAdminEmailsQuery } from '../../account/queries/get-emails.js';
import { createSendEmail } from '../../account/services/email.js';
import { getCareerProfileQuery } from '../queries/get-career-profile.js';
import {
  deleteCareerProfileCompanySizesQuery,
  deleteCareerProfileLanguagesQuery,
  deleteCareerProfileRolesQuery,
  updateCareerProfileCompanySizesQuery,
  updateCareerProfileLanguagesQuery,
  updateCareerProfileQuery,
  updateCareerProfileRolesQuery,
} from '../queries/update-career-profile.js';

interface Options {
  uid: string;
  data: {
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
  };
}

export const createUpdateCareerProfile = ({
  postgres,
  config,
}: Dependencies) => {
  return async ({ uid, data }: Options) => {
    const careerProfile = await postgres
      .exec(getCareerProfileQuery(uid))
      .then(firstRow);

    if (!careerProfile) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid career profile',
      });
    }

    const wasAlreadyComplete =
      careerProfile.areTermsAccepted && careerProfile.allowReceivingEmails;

    await postgres.exec(deleteCareerProfileLanguagesQuery(careerProfile.id));
    await postgres.exec(deleteCareerProfileRolesQuery(careerProfile.id));
    await postgres.exec(deleteCareerProfileCompanySizesQuery(careerProfile.id));

    if (data.languages.length > 0) {
      await postgres.exec(
        updateCareerProfileLanguagesQuery({
          careerProfileId: careerProfile.id,
          ...data,
        }),
      );
    }

    if (data.roles.length > 0) {
      await postgres.exec(
        updateCareerProfileRolesQuery({
          careerProfileId: careerProfile.id,
          ...data,
        }),
      );
    }

    if (data.companySizes.length > 0) {
      await postgres.exec(
        updateCareerProfileCompanySizesQuery({
          careerProfileId: careerProfile.id,
          ...data,
        }),
      );
    }

    await postgres.exec(
      updateCareerProfileQuery({
        careerProfileId: careerProfile.id,
        ...data,
      }),
    );

    const isNowComplete = data.areTermsAccepted && data.allowReceivingEmails;

    if (!wasAlreadyComplete && isNowComplete) {
      console.log('Career profile completed for user:', uid);
      const careerAdminEmails = await postgres.exec(
        getCareerAdminEmailsQuery(),
      );

      const sendEmail = createSendEmail({ config });
      const adminDashboardLink = `${config.domainUrl}/dashboard/administration/careers`;
      const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}New Plan B student application submission`;

      for (const admin of careerAdminEmails) {
        try {
          console.log(
            `Sending new career profile email to ${admin.email} for user ${uid}`,
          );
          await sendEmail({
            data: {
              adminDashboardLink: adminDashboardLink,
              subject,
            },
            email: admin.email,
            subject,
            template: 'd-98adfd2cafe740ee99fb3559d0dc77f6',
          });
        } catch (emailError) {
          console.error(
            `Failed to send career profile notification to ${admin.email} for user ${uid}:`,
            emailError,
          );
        }
      }
    }
  };
};
