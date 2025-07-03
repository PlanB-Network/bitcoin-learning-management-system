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
      confirmed: timestamp.confirmed,
      courseId: timestamp.courseId,
      examAttemptId: timestamp.examAttemptId,
      id: timestamp.id,
      imgKey: timestamp.imgKey,
      pdfKey: timestamp.pdfKey,
      uid: timestamp.uid,
    };
  };
};
