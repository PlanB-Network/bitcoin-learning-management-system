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
          uid: options.uid,
          courseId: options.courseId,
        }),
      )
      .then(() => void 0);
  };
};
