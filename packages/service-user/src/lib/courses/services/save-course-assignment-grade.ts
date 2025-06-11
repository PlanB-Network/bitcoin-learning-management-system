import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { getCourseCoordinatorsQuery } from '../queries/get-course-coordinators.js';
import { saveCourseAssignmentGradeQuery } from '../queries/save-course-assignment-grade.js';

interface Options {
  courseId: string;
  teacherUid: string;
  uid: string;
  grade: number | null;
}

export const createSaveCourseAssignmentGrade = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<void> => {
    const coordinators = await getCourseCoordinatorsQuery(options.courseId);
    const userDetails = await getUserByIdQuery(options.teacherUid).then(
      firstRow,
    );

    if (!coordinators.some((c) => c.professorId === userDetails?.professorId)) {
      throw new Error(
        `Teacher is not a coordinator of course ${options.courseId}`,
      );
    }

    return postgres
      .exec(
        saveCourseAssignmentGradeQuery(
          options.courseId,
          options.uid,
          options.grade,
        ),
      )
      .then(() => void 0);
  };
};
