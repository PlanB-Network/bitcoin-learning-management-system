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
    const BIZ225ID = 'c762773a-9017-4129-bc0e-06adf86050ef';
    const BIZ999ID = '576ac496-a4fd-471a-b022-e0da1ab89a29';

    const COURSES_CAREER_ACCESS = [BTC402ID, BIZ225ID, BIZ999ID];

    const userHasBoughtNecessaryCourses = userDetails?.boughtCourses?.some(
      (courseId) => COURSES_CAREER_ACCESS.includes(courseId),
    );

    if (!userHasBoughtNecessaryCourses) {
      throw new Error('User has not bought necessary courses');
    }

    return postgres.exec(insertCareerProfileQuery(uid));
  };
};
