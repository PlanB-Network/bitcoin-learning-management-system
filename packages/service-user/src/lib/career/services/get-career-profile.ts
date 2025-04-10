import { firstRow } from '@blms/database';
import type { JoinedCareerProfile } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';
import {
  getCareerProfileIdQuery,
  getCareerProfileQuery,
} from '../queries/get-career-profile.js';

interface Options {
  uid: string;
}

export const createGetCareerProfile = ({ postgres }: Dependencies) => {
  return async ({ uid }: Options): Promise<JoinedCareerProfile | null> => {
    const careerProfile = await postgres
      .exec(getCareerProfileQuery(uid))
      .then(firstRow);

    if (!careerProfile) {
      return null;
    }

    return careerProfile;
  };
};

export const createGetCareerProfileId = ({ postgres }: Dependencies) => {
  return async ({ uid }: Options): Promise<string | null> => {
    const careerProfile = await postgres
      .exec(getCareerProfileIdQuery(uid))
      .then(firstRow);

    if (!careerProfile) {
      return null;
    }

    return careerProfile.id;
  };
};
