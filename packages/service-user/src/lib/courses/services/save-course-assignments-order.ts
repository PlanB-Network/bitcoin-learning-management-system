import type { Dependencies } from '../../../dependencies.js';
import { saveCourseAssignmentsOrderQuery } from '../queries/save-course-assignments-order.js';

interface Options {
  uid: string;
  assignmentsIds: string[];
  courseId: string;
}

export const createSaveCourseAssignmentsOrder = ({
  postgres,
}: Dependencies) => {
  return (options: Options): Promise<void> => {
    return postgres
      .exec(
        saveCourseAssignmentsOrderQuery(
          options.courseId,
          options.assignmentsIds,
          options.uid,
        ),
      )
      .then(() => void 0);
  };
};
