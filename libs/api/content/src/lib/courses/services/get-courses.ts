import { Dependencies } from '../../dependencies';
import { getCoursesQuery } from '../queries';

export const createGetCourses =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const courses = await postgres.exec(getCoursesQuery(language));

    return courses;
  };
