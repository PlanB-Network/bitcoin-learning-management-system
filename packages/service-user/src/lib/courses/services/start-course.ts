import type { Dependencies } from '../../../dependencies.js';
import { saveCourseProgress } from '../queries/save-course-progress.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createStartCourse = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (options: Options): Promise<void> => {
    return postgres
      .exec(
        saveCourseProgress({
          courseId: options.courseId,
          uid: options.uid,
        }),
      )
      .then(() => void 0);
  };
};
