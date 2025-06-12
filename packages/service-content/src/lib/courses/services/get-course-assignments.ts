import type {
  CourseAssignment,
  MinimalCourseAssignmentWithStudents,
} from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import {
  getCourseAssignmentsQuery,
  getCourseAssignmentsWithStudentsGradesQuery,
} from '../queries/get-course-assignments.js';

export const createGetCourseAssignments = ({ postgres }: Dependencies) => {
  return async (courseId: string): Promise<CourseAssignment[]> => {
    return postgres.exec(getCourseAssignmentsQuery(courseId));
  };
};

export const createGetCourseAssignmentsWithStudentsGrades = ({
  postgres,
}: Dependencies) => {
  return async (
    courseId: string,
  ): Promise<MinimalCourseAssignmentWithStudents[]> => {
    return postgres.exec(getCourseAssignmentsWithStudentsGradesQuery(courseId));
  };
};
