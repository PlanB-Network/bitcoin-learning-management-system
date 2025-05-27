import type { CourseAssignment } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import { getCourseAssignmentsQuery } from '../queries/get-course-assignments.js';

export const createGetCourseAssignments = ({ postgres }: Dependencies) => {
  return async (courseId: string): Promise<CourseAssignment[]> => {
    return postgres.exec(getCourseAssignmentsQuery(courseId));
  };
};
