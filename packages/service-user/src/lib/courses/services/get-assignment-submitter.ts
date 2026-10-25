import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import {
  type AssignmentSubmitter,
  getAssignmentSubmitterQuery,
} from '../queries/get-assignment-submitter.js';

export type { AssignmentSubmitter };

/**
 * The assignment a student was given in a course: the only one they may
 * submit work for. `null` when the student has no assignment in this course.
 */
export const createGetAssignmentSubmitter = ({ postgres }: Dependencies) => {
  return async ({
    courseId,
    uid,
  }: {
    courseId: string;
    uid: string;
  }): Promise<AssignmentSubmitter | null> => {
    const submitter = await postgres
      .exec(getAssignmentSubmitterQuery(courseId, uid))
      .then(firstRow);

    return submitter ?? null;
  };
};
