import { firstRow } from '@blms/database';
import type { MinimalUserExamTimestamp } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getTeacherLedCourseDiplomaTimestampQuery } from '../queries/get-diploma-timestamp.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createGetTeacherLedCourseDiplomaTimestamp = ({
  postgres,
}: Dependencies) => {
  return async (options: Options): Promise<MinimalUserExamTimestamp | null> => {
    const timestamp = await postgres
      .exec(
        getTeacherLedCourseDiplomaTimestampQuery(options.uid, options.courseId),
      )
      .then(firstRow);

    if (!timestamp) {
      return null;
    }

    return {
      id: timestamp.id,
      uid: timestamp.uid,
      courseId: timestamp.courseId,
      confirmed: timestamp.confirmed,
      examAttemptId: timestamp.examAttemptId,
      imgKey: timestamp.imgKey,
      pdfKey: timestamp.pdfKey,
    };
  };
};
