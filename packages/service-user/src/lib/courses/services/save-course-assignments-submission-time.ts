import type { Dependencies } from '../../../dependencies.js';
import { saveCourseAssignmentSubmissionTimeQuery } from '../queries/save-course-assignments-submission-time.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createSaveCourseAssignmentSubmissionTime = ({
  postgres,
}: Dependencies) => {
  return (options: Options): Promise<void> => {
    return postgres
      .exec(
        saveCourseAssignmentSubmissionTimeQuery(options.courseId, options.uid),
      )
      .then(() => void 0);
  };
};
