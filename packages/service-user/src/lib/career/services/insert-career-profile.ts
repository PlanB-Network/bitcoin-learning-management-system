import type { JoinedCareerProfile } from '@blms/types';

import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { getUserByIdWithDetailsQuery } from '../../account/queries/get-user.js';
import { insertCareerProfileQuery } from '../queries/insert-career-profile.js';

interface Options {
  uid: string;
}

export const createInsertCareerProfile = ({ postgres }: Dependencies) => {
  return async ({ uid }: Options): Promise<JoinedCareerProfile[]> => {
    const userDetails = await postgres
      .exec(getUserByIdWithDetailsQuery(uid))
      .then(firstRow)
      .then((user) => user ?? null);

    const BTC402ID = '0b71eea1-4811-4601-a6ad-38d043b52dca';

    const userHasBoughtNecessaryCourses =
      userDetails?.boughtCourses?.includes(BTC402ID);

    if (!userHasBoughtNecessaryCourses) {
      throw new Error('User has not bought necessary courses');
    }

    return postgres.exec(insertCareerProfileQuery(uid));
  };
};
