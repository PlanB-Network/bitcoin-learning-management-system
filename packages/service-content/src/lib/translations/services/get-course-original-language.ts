import type { Dependencies } from '../../dependencies.js';
import { getCourseOriginalLanguageQuery } from '../queries/get-course-original-language.js';

export const createGetCourseOriginalLanguage = ({ postgres }: Dependencies) => {
  return async (courseId: string): Promise<string | null> => {
    const res = await postgres.exec(getCourseOriginalLanguageQuery(courseId));
    return res.length ? res[0].originalLanguage : null;
  };
};
