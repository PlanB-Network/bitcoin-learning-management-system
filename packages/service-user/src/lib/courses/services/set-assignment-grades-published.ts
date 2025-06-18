import { firstRow } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import {
  assignRankingToAllUsersQuery,
  assignTop21StudentsToFinalLessonQuery,
} from '../queries/assign-ranking.js';
import { calculateCourseScoreForAllUsers } from '../queries/calculate-score.js';
import { getCourseCoordinatorsQuery } from '../queries/get-course-coordinators.js';
import { setCourseAssignmentGradesAsPublishedQuery } from '../queries/set-assignment-grades-published.js';

interface Options {
  courseId: string;
  teacherUid: string;
}

export const createSetCourseAssignmentGradesAsPublished = ({
  postgres,
}: Dependencies) => {
  return async (options: Options): Promise<void> => {
    const coordinators = await postgres.exec(
      getCourseCoordinatorsQuery(options.courseId),
    );
    const userDetails = await postgres
      .exec(getUserByIdQuery(options.teacherUid))
      .then(firstRow);

    if (!coordinators.some((c) => c.professorId === userDetails?.professorId)) {
      throw new Error(
        `Teacher is not a coordinator of course ${options.courseId}`,
      );
    }

    await postgres.exec(calculateCourseScoreForAllUsers(options.courseId));

    await postgres.exec(assignRankingToAllUsersQuery(options.courseId));

    await postgres.exec(
      assignTop21StudentsToFinalLessonQuery(options.courseId),
    );

    return postgres
      .exec(setCourseAssignmentGradesAsPublishedQuery(options.courseId))
      .then(() => void 0);
  };
};
