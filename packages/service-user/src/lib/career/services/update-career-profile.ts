import type {
  CareerCompanySize,
  CareerLanguageLevel,
  CareerRemote,
  CareerRoleLevel,
} from '@blms/constants';

import { firstRow } from '@blms/database';
import { TRPCError } from '@trpc/server';
import type { Dependencies } from '../../../dependencies.js';
import { getCareerProfileIdQuery } from '../queries/get-career-profile.js';
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

export const createUpdateCareerProfile = ({ postgres }: Dependencies) => {
  return async ({ uid, data }: Options) => {
    const careerProfileId = await postgres
      .exec(getCareerProfileIdQuery(uid))
      .then(firstRow);

    if (!careerProfileId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid career profile',
      });
    }

    await postgres.exec(deleteCareerProfileLanguagesQuery(careerProfileId.id));
    await postgres.exec(deleteCareerProfileRolesQuery(careerProfileId.id));
    await postgres.exec(
      deleteCareerProfileCompanySizesQuery(careerProfileId.id),
    );

    if (data.languages.length > 0) {
      await postgres.exec(
        updateCareerProfileLanguagesQuery({
          careerProfileId: careerProfileId.id,
          ...data,
        }),
      );
    }

    if (data.roles.length > 0) {
      await postgres.exec(
        updateCareerProfileRolesQuery({
          careerProfileId: careerProfileId.id,
          ...data,
        }),
      );
    }

    if (data.companySizes.length > 0) {
      await postgres.exec(
        updateCareerProfileCompanySizesQuery({
          careerProfileId: careerProfileId.id,
          ...data,
        }),
      );
    }

    await postgres.exec(
      updateCareerProfileQuery({
        careerProfileId: careerProfileId.id,
        ...data,
      }),
    );
  };
};
