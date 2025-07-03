import { firstRow } from '@blms/database';
import type { JoinedCareerProfile } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { deleteCareerProfileQuery } from '../queries/delete-career-profile.js';
import { getCareerProfileIdQuery } from '../queries/get-career-profile.js';

interface Options {
  uid: string;
}

export const createDeleteCareerProfile = ({
  postgres,
  s3,
  log,
}: Dependencies) => {
  return async ({ uid }: Options): Promise<JoinedCareerProfile[]> => {
    const careerProfileId = await postgres
      .exec(getCareerProfileIdQuery(uid))
      .then(firstRow)
      .then((a) => a?.id ?? null);

    const deletedCareerProfile = await postgres.exec(
      deleteCareerProfileQuery(uid),
    );

    if (careerProfileId && deletedCareerProfile.length > 0) {
      try {
        await s3.delete(`cvs/${careerProfileId}`);
      } catch (error) {
        log('Error: Failed to delete related CV', careerProfileId, error);
      }
    }

    return deletedCareerProfile;
  };
};
