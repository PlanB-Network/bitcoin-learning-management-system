import { firstRow } from '@blms/database';
import type { Dependencies } from '#src/lib/dependencies.js';
import { getCourseCoordinatorsQuery } from '../../professors/queries/get-course-coordinators.js';
import { getUserProfessorIdQuery } from '../../professors/queries/get-user-professor-id.js';
import { setCourseAssignmentGradesAsPublishedQuery } from '../queries/set-assignment-grades-published.js';

interface Options {
  courseId: string;
  teacherUid: string;
}

export const createSetCourseAssignmentGradesAsPublished = ({
  postgres,
}: Dependencies) => {
  return async (options: Options): Promise<void> => {
    const coordinators = await getCourseCoordinatorsQuery(options.courseId);
    const userDetails = await getUserProfessorIdQuery(options.teacherUid).then(
      firstRow,
    );

    if (!coordinators.some((c) => c.professorId === userDetails?.professorId)) {
      throw new Error(
        `Teacher is not a coordinator of course ${options.courseId}`,
      );
    }

    return postgres
      .exec(setCourseAssignmentGradesAsPublishedQuery(options.courseId))
      .then(() => void 0);
  };
};
