import type { CourseActivity } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getRecentCourseActivityQuery } from '../queries/get-course-activity.js';

export const createGetCourseRecentActivity = ({ postgres }: Dependencies) => {
  return async (courseId: string): Promise<CourseActivity[]> => {
    return postgres.exec(getRecentCourseActivityQuery(courseId));
  };
};
