import type { Dependencies } from '../../../dependencies.js';
import { getUidCourseIdAndUsernameByExamTimestampIdQuery } from '../queries/get-diploma-timestamp.js';

interface Options {
  certificateId: string;
  isCourseWithSingleTrialExam: boolean;
}

interface UserDetails {
  uid: string;
  courseId: string;
  displayName: string;
  imgKey: string | null;
}

export const createGetUserDetailsByCertificateId = ({
  postgres,
}: Dependencies) => {
  return async (options: Options): Promise<UserDetails> => {
    const result = (await postgres.exec(
      getUidCourseIdAndUsernameByExamTimestampIdQuery(
        options.certificateId,
        options.isCourseWithSingleTrialExam,
      ),
    )) as UserDetails[];

    if (!result || result.length === 0) {
      throw new Error('No data found for the provided certificateId');
    }

    return result[0];
  };
};
