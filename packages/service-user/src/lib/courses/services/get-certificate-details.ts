import type { Dependencies } from '../../../dependencies.js';
import { getUidCourseIdAndUsernameByCertificateIdQuery } from '../queries/get-exam-questions.js';

interface Options {
  certificateId: string;
}

interface UserDetails {
  uid: string;
  courseId: string;
  displayName: string;
}

export const createGetUserDetailsByCertificateId = ({
  postgres,
}: Dependencies) => {
  return async (options: Options): Promise<UserDetails> => {
    const result = (await postgres.exec(
      getUidCourseIdAndUsernameByCertificateIdQuery(options),
    )) as UserDetails[];

    if (!result || result.length === 0) {
      throw new Error('No data found for the provided certificateId');
    }

    return result[0];
  };
};
