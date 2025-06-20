import type { Dependencies } from '../../../dependencies.js';
import { getUidCourseIdAndUsernameByExamTimestampIdQuery } from '../queries/get-diploma-timestamp.js';
import { getUidCourseIdAndUsernameByCertificateIdQuery } from '../queries/get-exam-questions.js';

interface Options {
  certificateId: string;
  isCourseWithSingleTrialExam?: boolean;
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
    const result = (
      options.isCourseWithSingleTrialExam
        ? await postgres.exec(
            getUidCourseIdAndUsernameByExamTimestampIdQuery(
              options.certificateId,
            ),
          )
        : await postgres.exec(
            getUidCourseIdAndUsernameByCertificateIdQuery(
              options.certificateId,
            ),
          )
    ) as UserDetails[];

    if (!result || result.length === 0) {
      throw new Error('No data found for the provided certificateId');
    }

    return result[0];
  };
};
