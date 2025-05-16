import type { Dependencies } from '../../dependencies.js';
import {
  type CourseTranslationResponse,
  getCourseTranslationsQuery,
} from '../queries/get-course-translations.js';

export const createGetCourseTranslations = ({ postgres }: Dependencies) => {
  return async (language?: string): Promise<CourseTranslationResponse[]> => {
    return postgres.exec(getCourseTranslationsQuery(language));
  };
};
